const babel = require("gulp-babel")
const clean = require("gulp-clean")
const gulp = require("gulp")
const path = require("path")
const sourcemaps = require("gulp-sourcemaps")
const tsc = require("gulp-typescript")
const mergeStream = require("merge-stream")

const srcDir = "./src"
const outDir = "./dist"

gulp.task("clean", function() {
  return gulp.src(outDir, { read: false }).pipe(clean())
})

gulp.task("compile", () => {
  const tsProject = tsc.createProject("tsconfig.json")

  const tsResult = gulp
    .src(`${srcDir}/**/*.{ts,tsx}`)
    .pipe(sourcemaps.init())
    .pipe(tsProject())

  const tsStream = tsResult.js
    .pipe(babel())
    .pipe(
      sourcemaps.write(".", {
        // Properly map paths contained in the resulting source-map to the original source,
        // as described here https://github.com/gulp-sourcemaps/gulp-sourcemaps/issues/191#issuecomment-278361101
        mapSources: (sourcePath, file) => {
          const distDir = path.join(outDir, path.dirname(file.relative))
          const relativeDistDir = path.relative(distDir, srcDir)
          return path.join(relativeDistDir, sourcePath)
        },
      })
    )
    .pipe(gulp.dest(outDir))

  const graphqlJsStream = gulp
    .src(`${srcDir}/**/*.graphql.js`)
    .pipe(babel())
    .pipe(gulp.dest(outDir))

  return mergeStream(tsStream, graphqlJsStream)
})

gulp.task("default", ["clean", "compile"])
