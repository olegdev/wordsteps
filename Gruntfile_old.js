GLOBAL.BASE_PATH = __dirname;
GLOBAL.SERVICES_PATH = __dirname + '/server/services';

var dictionary = require('./server/services/dictionary/dictionary');
var fs = require('fs');
var _ = require('underscore');

module.exports = function(grunt) {

    grunt.initConfig({
        watch: {
            scripts: {
                files: ['**/*.xcss'],
                tasks: ['cssbackground']
            },
        },
        cssbackground: {
            options:{
                excss_file_ext: 'xcss',
                excss_src: './client/js/app',
                atlas_src: './client/img',
                img_url: 'img',
                img_ext: 'png',
                dest: './client/css',
            }
        },
        references: {
            options:{
                src: './server/services/references',
                dest: './client/js/references',
            }
        },
        dictionary: {
            options:{
                src: './server/services/references',
                dest: './server/services/dictionary',
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('cssbackground', 'Формирует css стили для картинки из атласа.', function() {
        var options = this.options(),
            atlases = {}; 

        var findXCSS = function(path, buff) {
            grunt.file.recurse(path, function(abspath, rootdir, subdir, filename) {
                if (grunt.file.isDir(abspath)) {
                    findXCSS(abspath, buff);
                } else if (grunt.file.isFile(abspath)) {
                    if (filename.substr(filename.length-options.excss_file_ext.length) == options.excss_file_ext) {
                        buff.push({path: abspath, filename: filename});
                    }
                }
            });
        }

        var files = [];

        // находим все "excss" файлы
        findXCSS(options.excss_src, files);

        /***/ grunt.log.writeln("Найдено " + files.length + " "+ options.excss_file_ext +" файлов.");

        // для каждого файла
        files.forEach(function(item) {
            var str = grunt.file.read(item.path);
            // находим вызовы команды вида "/**@background ..." и заменяем на конкретные стили
            var matches = str.match(/\/\*\*@background\s[\sa-z0-9\.\-_]+\*\//gi);            
            if (matches && matches.length) {
                matches.forEach(function(m) {
                    var arg = '',
                        atlaseName,
                        imgName,
                        style;
                    var parts = m.split(' ');
                    parts.shift();
                    parts.forEach(function(part) {
                        if (/^--/.test(part)) {
                            arg = part.substr(2);
                        } else if (arg) {
                            if (arg == 'atlas') {
                                atlaseName = part;
                            } else if (arg == 'img') {
                                imgName = part.substr(0, part.length-2); // удаляю терминальные символы "*/"
                            } else {
                                /***/ grunt.log.error('Неизвестный аргумент вызова команды "' + arg + '"');
                            }
                        } else {
                            /***/ grunt.log.error('Неверный формат вызова команды "' + m + '"');
                        }
                    });
                    if (atlaseName && imgName) {
                        if (!atlases[atlaseName]) {
                            if (grunt.file.isFile(options.atlas_src + '/' + atlaseName + '.json')) {
                                atlases[atlaseName] = JSON.parse(fs.readFileSync(options.atlas_src + '/' + atlaseName + '.json', 'utf8'));
                            } else {
                                /***/ grunt.log.error('Файл атласа не найден "' + atlaseName + '"');
                            }
                        }
                        if (atlases[atlaseName].frames[imgName]) {
                            style = 'background-image: url('+ options.img_url + '/' + atlaseName + '.' + options.img_ext + ');\n' +
                                    'background-position: ' + atlases[atlaseName].frames[imgName].frame.x + 'px ' + atlases[atlaseName].frames[imgName].frame.y + 'px;\n'+
                                    'width: ' + atlases[atlaseName].frames[imgName].frame.w + 'px;' +
                                    'height: ' + atlases[atlaseName].frames[imgName].frame.h + 'px;';
                            str = str.replace(m, style);
                        } else {
                            /***/ grunt.log.error('Данные для картинки "' + imgName + '" в атласе "' + atlaseName + '" не определены');
                        }
                    } else {
                        /***/ grunt.log.error('Неверный формат вызова команды "' + m + '" Файл атласа или картинки не определен');
                    }
                });
            }
            // и сохраняем в нужную папку
            grunt.file.write(options.dest + '/' + item.filename.replace(options.excss_file_ext, 'css'), str, {encoding: 'utf8'});
        });

    });

    grunt.registerTask('references', 'Обработка справочников для клиента', function() {
        var options = this.options();        

        grunt.file.recurse(options.src, function(abspath, rootdir, subdir, filename) {
            var str = grunt.file.read(abspath),
                json, jsonCopy, lang, strCopy;
            if (!/^\/\/@ignore/.test(str) && filename.substr(filename.length-2) == 'js') {

                //данные
                json = grunt.file.read(abspath + 'on');

                // для каждого языка
                for(var k = 0; k < dictionary.langs.length; k++) {
                    lang = dictionary.langs[k];
                    jsonCopy = '' + json;
                    strCopy = '' + str;

                    // создаю папку если ее еще нет
                    if (!fs.existsSync(options.dest + '/' + lang)) {
                        fs.mkdirSync(options.dest + '/' + lang);
                    }

                    // перевод
                    var matches = jsonCopy.match(/dictionary\([A-Z0-9_]+\)/gi);
                    if (matches && matches.length) {
                        matches.forEach(function(m) {
                            var index = m.search(/\([A-Z0-9_]+\)/i);
                            if (index != -1) {
                                var key = m.substr(index+1);
                                key = key.substr(0,key.length-1); // удаляю скобки
                                jsonCopy = jsonCopy.replace(m, dictionary.get(lang, key));                                
                            }
                        });
                    }

                    // вставляю переведенные данные в файл клиентского модуля
                    strCopy = strCopy.replace('Reference.data = JSON.parse(require(\'fs\').readFileSync(__filename + \'on\', \'utf8\'));', 'Reference.data = ' + jsonCopy + ';');

                    // оборачиваю в модуль requirejs
                    strCopy = 'define(function() {\nvar module = {exports: {}};\n' + strCopy + '\nreturn module.exports; });';

                    // и кладу в нужную папку под тем же именем
                    grunt.file.write(options.dest + '/' + lang + '/' + filename, strCopy, {encoding: 'utf8'});
                }
            }
        });

    });

    grunt.registerTask('dictionary', 'Обновляние словаря', function() {
        var options = this.options();        

        grunt.file.recurse(options.src, function(abspath, rootdir, subdir, filename) {
            var dic,
                json,
                keys = [],
                oldKeys = [],
                noChanges = true;

            if (filename.substr(filename.length-4) == 'json') {
                //данные справочника
                json = grunt.file.read(abspath);

                // нахожу все ключи 
                var matches = json.match(/dictionary\([A-Z0-9_]+\)/gi);
                if (matches && matches.length) {
                    matches.forEach(function(m) {
                        var index = m.search(/\([A-Z0-9_]+\)/i);
                        if (index != -1) {
                            var key = m.substr(index+1);
                            key = key.substr(0,key.length-1); // удаляю скобки
                            keys.push(key);
                        }
                    });
                }

                // для каждого языка
                for(var k = 0; k < dictionary.langs.length; k++) {
                    var lang = dictionary.langs[k];
                    // создаю папку если ее еще нет
                    if (!fs.existsSync(options.dest + '/' + lang)) {
                        fs.mkdirSync(options.dest + '/' + lang);
                    }
                    // достаю словарь если он есть
                    if (fs.existsSync(options.dest + '/' + lang + '/' + filename)) {
                        dic = JSON.parse(fs.readFileSync(options.dest + '/' + lang + '/' +filename, 'utf8'));
                    } else {
                        dic = {};
                    }

                    // вставляю новые ключи, оставляя перевод
                    for(var i = 0; i < keys.length; i++) {
                        if (!dic[keys[i]]) {
                            dic[keys[i]] = keys[i];
                            noChanges = false;
                        }
                    }

                    // удаляю устаревшие ключи
                    oldKeys = _.difference(_.keys(dic), keys);
                    if (oldKeys.length) {
                        for(var i = 0; i < oldKeys.length; i++) {
                            delete dic[oldKeys[i]];
                        }
                        noChanges = false;
                    }
                    
                    // и записываю файл словаря
                    if (!noChanges) {
                        grunt.file.write(options.dest + '/' + lang + '/' + filename, JSON.stringify(dic), {encoding: 'utf8'});
                    }
                }
            }
        });

    });

};