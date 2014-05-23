// Include gulp
var gulp = require("gulp");

// Include Our Plugins
var jshint = require("gulp-jshint");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var wrap = require("gulp-wrap");
var wrapumd = require("gulp-wrap-umd");
var replace = require("gulp-replace");

// Lint Task
gulp.task("lint", function() {
  return gulp.src("lib/*.js")
      .pipe(jshint())
      .pipe(jshint.reporter("default"));
});

// Concatenate & Minify JS
gulp.task("js", function() {
  return gulp.src(["lib/**/*.js", "index.js"])
      .pipe(replace(/var .* = require.*;/g, ""))
      .pipe(replace(/module.exports = .*;/g, ""))
      .pipe(concat("all.js"))
      .pipe(wrap("(function() {<%= contents %>\nreturn exports;\n})()"))
      .pipe(wrapumd({ namespace: "cyclops" }))
      .pipe(gulp.dest("dist"))
});

// Watch Files For Changes
gulp.task("watch", function() {
  gulp.watch("lib/**/*.js", ["lint", "js"]);
});

// Default Task
gulp.task("default", ["lint", "js", "watch"]);