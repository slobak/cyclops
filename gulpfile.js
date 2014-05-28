"use strict";

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
var browserify = require("gulp-browserify");

// Lint Task
gulp.task("lint", function() {
  return gulp.src("lib/*.js")
      .pipe(jshint())
      .pipe(jshint.reporter("default"));
});

//var buildBrowserJs = function(stream, filename) {
//  return stream.pipe(replace(/var .* = require.*;/g, ""))
//      .pipe(replace(/module.exports = .*;/g, ""))
//      .pipe(concat(filename))
//      .pipe(wrap("(function() {<%= contents %>\nreturn exports;\n})()"))
//      .pipe(wrapumd({ namespace: "cyclops" }))
//      .pipe(gulp.dest("dist"));
//};
//
// Concatenate & Minify JS
gulp.task("js-record", function() {
  return gulp.src("lib/record/index.js")
      .pipe(browserify({ standalone: "CyclopsRecord" }))
      .pipe(rename("cyclops-record.js"))
      .pipe(gulp.dest("dist"));
});

gulp.task("js-replay", function() {
  return gulp.src("lib/replay/index.js")
      .pipe(browserify({ standalone: "CyclopsReplay" }))
      .pipe(rename("cyclops-replay.js"))
      .pipe(gulp.dest("dist"));
});

// All JS
gulp.task("js", ["js-record", "js-replay"]);

// Watch Files For Changes
gulp.task("watch", function() {
  gulp.watch("lib/**/*.js", ["lint", "js"]);
});

// Default Task
gulp.task("default", ["lint", "js", "watch"]);