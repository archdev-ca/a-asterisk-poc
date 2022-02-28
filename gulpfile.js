// Initialize the packages
var gulp = require("gulp");
var sass = require("gulp-dart-sass");
var autoprefixer = require("gulp-autoprefixer");
var browserSync = require("browser-sync").create();

// The input scss files (all .scss files inside /scss dir including subdirs)
var input = "./scss/**/*.scss";

// The compiled css file destination directory
var output = "./css";

/**
 * SASS compiler options
 * - output errors to console
 */
var sassOpts = {
  errorLogToConsole: true,
  outputStyle: "expanded",
};

// Create a task called sass-tasks
gulp.task(
  "sass-tasks",
  gulp.series(function () {
    return gulp
      .src(input) // open the source file
      .pipe(sass(sassOpts).on("error", sass.logError)) // run sass compiler
      .pipe(autoprefixer()) // run autoprefixer
      .pipe(gulp.dest(output)); // copy the output .css file to the destination dir
  })
);

// Create a task called `serve` which will run sass-tasks and many others
gulp.task(
  "serve",
  gulp.series("sass-tasks", function () {
    browserSync.init({
      injectChanges: true,
      open: true,
      server: {
        baseDir: "./",
      },
    });

    // Run sass-tasks whenever /scss/*.scss files are changed
    gulp.watch("scss/**/*.scss", gulp.series("sass-tasks"));

    // Reload browserSync whenever .js, .css, and .html files change
    gulp
      .watch(["js/*.js", "css/*.css", "*.html"])
      .on("change", browserSync.reload);
  })
);

// Create the main task called `default` which will run the task `serve`
gulp.task("default", gulp.series("serve"));
