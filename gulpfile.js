var gulp = require('gulp')
var connect = require('gulp-connect')

gulp.task('static', function() {
	return gulp.src('./**/*.*')
		.pipe(connect.reload())
});
gulp.task('connect', function() {
	connect.server({
		root: '.',
		livereload: true
	});
});
gulp.task('default', ['connect'],function() {
	gulp.watch('./**/*.*', ['static'])
});
