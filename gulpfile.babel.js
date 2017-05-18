import gulp from "gulp";
import path from "path";
import rimraf from "rimraf";

const $ = require("gulp-load-plugins")();

gulp.task("server:clean", cb => {
    rimraf("./build", () => cb());
});

function compileServer() {
    return gulp.src("./src/server/**/*.js")
        .pipe($.changed("./build"))
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.sourcemaps.write(".", {sourceroot: path.join(__dirname, "src", "server")}))
        .pipe(gulp.dest("./build"));
}

gulp.task("server:build", 
    gulp.series(
        "server:clean",
        compileServer
    )
);

function watchServer() {
    return gulp
        .watch("./src/server/**/*.js", gulp.series(compileServer))
        .on("error", () => {});
}

gulp.task(
    "server:watch",
    gulp.series(
        "server:build",
        watchServer
    )
);

gulp.task(
    "server:dev",
    gulp.series(
        "server:build",
        gulp.parallel(
            "server:watch",
            function nodemon() {
                return $.nodemon({
                    scrip: "./server.js",
                    watch: "build"
                });
            }
        )
    )
);