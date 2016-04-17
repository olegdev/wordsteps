/**
 * Формирует словарь справочника
 * Подготавливает модуль справочника для клиента
 */

var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var translate = require(SERVICES_PATH + '/translate/translate');

var searchKeys = function(obj, prop, value) {
    var keys = [],
        innerKeys = [];
    for(var k in obj) {
        if (typeof obj[k] == 'object') {
            if (obj[k][prop] == value) {
                keys.push(k);
            } else {
                innerKeys = searchKeys(obj[k], prop, value);
                if (innerKeys.length) {
					innerKeys.forEach(function(innerKey) {
						if (typeof innerKeys == 'string') {
							keys.push([k, innerKey]);
						} else {
							keys.push([k].concat(innerKey));
						}
					});
                }
            }
        }
    }
    return keys;
}

var getValueByKey = function(obj, key) {
	if (typeof key == 'string') {
		return obj[key];
	} else if (key.length == 1) {
		return obj[key[0]];
	} else {
		key.shift();
		return getValueByKey(obj[key[0]], key);
	}
}

var setValueByKey = function(obj, key, value) {
	if (typeof key == 'string') {
		obj[key] = value;
	} else if (key.length == 1) {
		obj[key[0]] = value;
	} else {
		key.shift();
		setValueByKey(obj[key[0]], key, value);
	}
}

var getAtlasInfo = function(atlasName) {
	var atlasFilePath = BASE_PATH + '/client/img/'  + atlasName + '/' + atlasName + '.json';
	if (fs.existsSync(atlasFilePath)) {
		return JSON.parse(fs.readFileSync(atlasFilePath, 'utf8'));
	}
}

module.exports = function(grunt) {
	return function() {
	    var options = this.options();        
	    var filePath = grunt.config("changed_ref_filepath");
	    
		var referenceFileName = path.basename(filePath);

	    // подгружаю данные справочника
	    var data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

	    // подгружаю конфиг справочника
	    var config = JSON.parse(fs.readFileSync(filePath.replace('.json', '.config'), 'utf8'));

		// нахожу все ключи, которые являются переводимыми
	    var translatableKeys = searchKeys(config.scheme, "translatable", true);

		// нахожу все ключи, которые являются атласами картинок
	    var atlasKeys = searchKeys(config.scheme, "atlas", true);

	    // для каждой строки справочника нахожу переводимые строки (формирую словарь), а строки атласа меняю на инфу атласа
	    var translates = {},
	    	atlases = {};

	    data.forEach(function(item) {
	    	translatableKeys.forEach(function(key) {
	    		var value = getValueByKey(item, key)
	    		translates[value] = value;
	    	});
	    	atlasKeys.forEach(function(key) {
	    		var value = getValueByKey(item, key);
	    		if (value) {
	    			value = value.split(' ');
		    		if (value.length == 2) {
		    			var atlasName = value[0],
		    				imageName = value[1];
		    			if (!atlases[atlasName]) {
		    				atlases[atlasName] = getAtlasInfo(atlasName);
		    			}
		    			if (atlases[atlasName]) {
		    				if (atlases[atlasName].frames[imageName]) {
		    					setValueByKey(item, key, {
		    						atlas: atlasName,
		    						frame: atlases[atlasName].frames[imageName].frame,
		    					});
		    				} else {
		    					/***/ grunt.log.error('Данные изображений "' + imageName + '" в атласе "'+ atlasName +'"не найдены');	
		    				}
		    			} else {
		    				/***/ grunt.log.error('Данные атласа "' + atlasName + '" не найдены');
		    			}
		    		} else {
		    			/***/ grunt.log.error('Неверный формат атласа "' + value + '"');
		    		}
		    	}
	    	});
	    });

	    // сохраняю словарь в файл для дефолнтого языка
	    if (!fs.existsSync(options.translateDest + '/' + translate.defaultLang)) {
	    	fs.mkdirSync(options.translateDest + '/' + translate.defaultLang);
	    }	    
	    fs.writeFileSync(options.translateDest + '/' + translate.defaultLang + '/' + referenceFileName, JSON.stringify(translates), {encoding: 'utf8'});

	    // сохраняю справочник как клиентский модуль
	    var fileStr = fs.readFileSync(filePath.replace('.json', '.js'), 'utf8');
		fileStr = fileStr.replace('Reference.data = JSON.parse(require(\'fs\').readFileSync(__filename + \'on\', \'utf8\'));', 'Reference.data = ' + JSON.stringify(data) + ';');
		fileStr = 'define(function() {\nvar module = {exports: {}};\n' + fileStr + '\nreturn module.exports; });'; // оборачиваю в модуль requirejs
		fs.writeFileSync(options.dest + '/' + translate.defaultLang + '/' + referenceFileName.replace('.json', '.js'), fileStr, {encoding: 'utf8'}); // и кладу в нужную папку под тем же именем
	}
};