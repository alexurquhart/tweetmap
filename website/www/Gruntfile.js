module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		less: {
			files: {
				expand: true,
				cwd   : 'src/',
				src   : ['css/**/*.less', '!bower_components/**/*'],
				dest  : 'dist/',
				ext   : '.css'
			}
		},

		typescript: {
			files: {
				src: ['src/**/*.ts', '!src/js/types/**/*'],
				dest: 'dist/js/App.js',
			},
			options: {
				module        : 'commonjs',
				target        : 'es5',
				basePath      : 'src/',
				sourceMap     : true,
				removeComments: true
			}
		},

		tslint: {
			files: {
				src: ['src/**/*.ts', '!src/js/types/**/*', '!src/js/lib/**/*']
			},
			options: {
				configuration: grunt.file.readJSON("tslint.json")
			}
		},

		copy: {
			dev: {
				files: [{
					expand: true,
					cwd   : 'src/',
					src   : ['bower_components/**/*', '*.html', 'assets/**/*'],
					dest  : 'dist/',
					filter: 'isFile'
				}],
			},
			prod: {
				files: [{
					expand: true,
					cwd   : 'src/',
					src   : ['bower_components/**/*', 'assets/**/*'],
					dest  : 'dist/',
					filter: 'isFile'
				}]
			}
		},

		htmlmin: {
			files: {
				expand: true,
				cwd: 'src/',
				src: ['*.html'],
				dest: 'dist/',
			},
			options: {
				collapseWhitespace        : true,
				removeComments            : true,
				removeRedundantAttributes : true,
				useShortDoctype           : true,
				removeScriptTypeAttributes: true,

			}
		},

		inject: {
			dev: {
				scriptSrc: ['src/js/lib/inject.js'],
				files: [{
					expand: true,
					cwd   : 'src/',
					src   : ['**/*.html', '!bower_components/**/*'],
					dest  : 'dist/',
					filter: 'isFile'
				}]
			}
		},

		clean: ["dist/*"],

		watch: {
			less: {
				files: ['src/**/*.less', '!bower_components/**/*'],
				tasks: ['less'],
				options: {
					livereload: true
				}
			},
			typescript: {
				files: ['src/**/*.ts', '!bower_components/**/*'],
				tasks: ['tslint', 'typescript'],
				options: {
					livereload: true
				}
			},
			html: {
				files: ['src/*.html'],
				tasks: ['inject:dev'],
				options: {
					livereload: true
				}
			},
			assets: {
				files: ['src/assets/**/*'],
				tasks: ['copy:dev'],
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-typescript');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-tslint');
	grunt.loadNpmTasks('grunt-inject');

	grunt.registerTask('default', ['clean', 'tslint', 'typescript', 'less', 'htmlmin', 'copy:prod']);
};