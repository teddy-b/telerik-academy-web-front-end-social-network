const gulp = require("gulp");
const gulpsync = require("gulp-sync")(gulp);
const clean = require("gulp-clean");
const sassLint = require("gulp-sass-lint");
const eslint = require("gulp-eslint");
const babel = require("gulp-babel");
const sass = require("gulp-sass");
const nodemon = require("gulp-nodemon");
const ghPages = require("gulp-gh-pages");

gulp.task("clean", () => {
  return gulp.src("build", { read: false })
  .pipe(clean({ force: true }));
});

gulp.task("copy:html", () => {
  return gulp.src("src/**/*.html")
  .pipe(gulp.dest("build"));
});

gulp.task("copy:bower-components", () => {
  return gulp.src("src/client/bower_components/**/*.*")
  .pipe(gulp.dest("build/client/bower_components"));
});

gulp.task("copy:assets", () => {
  return gulp.src("src/client/assets/**/*.*")
  .pipe(gulp.dest("build/client/assets"));
});

gulp.task("copy", gulpsync.sync(["copy:html", "copy:bower-components", "copy:assets"]));

gulp.task("lint:sass", () => {
  return gulp.src(["src/**/*.s+(a|c)ss", "!**/bower_components/**"])
  .pipe(sassLint())
  .pipe(sassLint.format())
  .pipe(sassLint.failOnError());
});

gulp.task("lint:js", () => {
  return gulp.src(["src/**/*.js", "!node_modules/**", "!**/bower_components/**"])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
});

gulp.task("lint", ["lint:sass", "lint:js"]);

gulp.task("compile:js", () => {
  return gulp.src("src/**/*.js")
  .pipe(babel({ presets: ["es2015"] }))
  .pipe(gulp.dest("build"));
});

gulp.task("compile:sass", () => {
  return gulp.src("src/**/main.scss")
  .pipe(sass().on("error", sass.logError))
  .pipe(gulp.dest("build"));
});

// gulp.task("sass:watch", () => {
//   gulp.watch("src/**/*.scss", ["compile:sass"]);
// });

gulp.task("compile", gulpsync.sync(["compile:js", "compile:sass"]));

gulp.task("build", gulpsync.sync(["lint", "clean", "compile", "copy"]));

gulp.task("serve", ["build"], () => {
  nodemon({
    script: "./build/server.js",
    ext: "js html scss",
    env: { "NODE_ENV": "development" },
    tasks: ["build"]
  });
});

gulp.task("deploy", () => {
  return gulp.src("./build/**/*")
  .pipe(ghPages());
});
