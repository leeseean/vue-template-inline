const path = require('path');
const fs = require('fs');
const through = require('through2');
const gutil = require('gulp-util');
const compiler = require('vue-template-compiler');
const transpile = require('vue-template-es2015-compiler');

const PLUGIN_NAME = 'vue-template-inline';

function templateToInline(templateContents) {
    const toFunction = code => {
        code = transpile(`function render(){${code}}`)
        code = code.replace(/^function render\(\)\{|\}$/g, '')
        return new Function(code)
    }

    const res = compiler.compile(templateContents);

    if (res.errors && res.errors.length > 0) {
        throw (new Error(res.errors.join("\n")));
    }

    let replaceWith = `render: ${toFunction(res.render)}`;
    if (res.staticRenderFns.length > 0) {
        replaceWith += `,\r\nstaticRenderFns: [${res.staticRenderFns.map(toFunction)}]`;
    }
    return replaceWith;
}

function gulpInlineVue(options) {
    return through.obj(function (file, encode, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported'));
            return callback();
        }

        let contents = file.contents.toString();
        /* Do we have a template property that contains something that looks like a url ? */
        
        try {
            /* If it starts and end with tags we should try and compile it */
            const templateTagMatch = /([\"\']?)(template)\1:(?:\s*)([\"\'`])(?:\s*)(?:\n*|\\n*)(?:\s*)<([\s\S]*?)>(?:\s*)(?:\n*|\\n*)(?:\s*)\3/i.exec(contents);
            if (templateTagMatch) {
                const templateLiteral = `<${templateTagMatch[4]}>`
                    .replace(/\\"/g, "\"")
                    .replace(/\\'/g, "\'")
                    .replace(/\\n/g, "\n");

                contents = contents.replace(templateTagMatch[0], templateToInline(templateLiteral));
            }
        } catch (err) {
            this.emit('error', new gutil.PluginError(PLUGIN_NAME, `from ${PLUGIN_NAME} in file ${file.path}:\n   ${err.message}`));
        }

        file.contents = new Buffer(contents);
        callback(null, file);
    });
}

module.exports = gulpInlineVue;