var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var gulpLess = require('gulp-less');
var gulpUglify = require('gulp-uglify');
var gulpRename = require('gulp-rename');
var gulpUtil = require('gulp-util');
var gulpDirectiveReplace = require('gulp-directive-replace');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');
var LessPluginCleanCss = require('less-plugin-clean-css');
var autoPrefix = new LessPluginAutoPrefix({
    browsers: ['last 2 versions']
});
var cleanCss = new LessPluginCleanCss();
var runSequence = require('run-sequence');

gulp.task('less', function () {
    return gulp
        .src('src/tw-ui-table.less')
        .pipe(gulpLess({
            plugins: [autoPrefix, cleanCss]
        }).on('error', function (err) {
            gulpUtil.log(err);
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('js', function () {
    return gulp
        .src('src/tw-ui-table.js')
        .pipe(gulpDirectiveReplace({
            root: 'src'
        }))
        .pipe(gulp.dest('dist/'));
});

gulp.task('js_min', function () {
    return gulp
        .src('src/tw-ui-table.js')
        .pipe(gulpDirectiveReplace({
            root: 'src'
        }))
        .pipe(gulpUglify())
        .pipe(gulpRename('tw-ui-table.min.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('serve', function () {
    gulp.watch('src/*.html', ['js', 'js_min']);
    gulp.watch('src/*.js', ['js', 'js_min']);
    gulp.watch('src/*.less', ['less']);
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