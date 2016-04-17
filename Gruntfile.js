var fs = require('fs');

GLOBAL.BASE_PATH = __dirname;
GLOBAL.SERVICES_PATH = __dirname + '/server/services';
GLOBAL.CONFIG = JSON.parse(fs.readFileSync(BASE_PATH + '/server.config'));

module.exports = function(grunt) {

    grunt.initConfig({
        watch: {
            scripts: {
                files: ['./server/services/references/**/*.json'],
                tasks: ['references']
            },
            options: {
                spawn: false,
            },
        },       
        references: {
            options:{
                dest: './client/js/references',
                translateDest: './server/services/translate',
            }
        },
        dictionary: {
            options: {
                dataFileName: './data/dictionary.txt',
            }
        },
        bots: {
            options: {}
        },
        patch_users: {
            options: {}
        },
        px_to_em: {
            options: {
                dataFileName: 'px.txt',
                destFileName: 'em.txt',
                emSize: 1.333,
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('references', require('./tasks/references')(grunt));
    grunt.registerTask('dictionary', require('./tasks/dictionary')(grunt));
    grunt.registerTask('bots', require('./tasks/bots')(grunt));
    grunt.registerTask('patch_users', require('./tasks/patch_users')(grunt));
    grunt.registerTask('px_to_em', require('./tasks/px_to_em')(grunt));

    grunt.event.on('watch', function(action, filepath) {
        grunt.config("changed_ref_filepath", filepath);
    });

};