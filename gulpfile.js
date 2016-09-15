var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var gulpLess = require('gulp-less');
var gulpUglify = require('gulp-uglify');
var gulpRename = require('gulp-rename');
var gulpUtil = require('gulp-util');
var lessPluginAutoPrefix = require('less-plugin-autoprefix');
var lessPluginCleanCss = require('less-plugin-clean-css');
var autoPrefix = new lessPluginAutoPrefix({
    browsers: ['last 2 versions']
});
var cleanCss = new lessPluginCleanCss();
var runSequence = require('run-sequence');

gulp.task('less', function() {
    return gulp
        .src('src/tw-ui-table.less')
        .pipe(gulpLess({
            plugins: [autoPrefix, cleanCss]
        }).on('error', function(err) {
            gulpUtil.log(err);
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('js', function() {
    return gulp
        .src('src/tw-ui-table.js')
        .pipe(gulp.dest('dist/'));
});

gulp.task('js_min', function() {
    return gulp
        .src('src/tw-ui-table.js')
        .pipe(gulpUglify())
        .pipe(gulpRename('tw-ui-table.min.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('serve', function() {
    gulp.watch('src/tw-ui-table.js', ['js', 'js_min']);
    gulp.watch('src/tw-ui-table.less', ['less']);
    browserSync.init({
        server: {
            baseDir: './'
        },
        startPath: '/example',
        files: [
            'dist/**/*',
            'example/**/*'
        ]
    });
});

gulp.task('serve-sync', ['less', 'js', 'js_min', 'serve']);
