# Gulp Inline Vue

This plugin will allow you to use url syntax in your template line to compile and inline templates in your source code.

Also any inline templates will be compiled as well.

# Installation

```
npm install vue-template-inline --save-dev
```

# Usage

If your template line looks like it is including a vue file then it will be compiled and inlined during the gulp pipe process.

myView.js
```
Vue.component('example', {
    template: `
        <div>
            <div v-if="show" v-for="(item, index) in list">{{item}}</div>
        </div>
    `,
    data() {
        return {
            show: true,
            list: [1,2,3,4,5],
        };
    }
});
```

If you then pipe your source through the plugin during your gulp processing as follows:

```
var inlineVue = require('vue-template-inline');

gulp.task('inline-vue', function () {
  return gulp.src('./src/**/*.js')
    .pipe(inlineVue())
    .pipe(gulp.dest('./dist'));
});
```

Your output will be:

myView.js
```
"use strict";
Vue.component("example", {
    render: function () {
        var n = this,
            e = n.$createElement,
            r = n._self._c || e;
        return r("div", n._l(n.list, function (e, t) {
            return n.show ? r("div", [n._v(n._s(e))]) : n._e()
        }))
    },
    data: function () {
        return {
            show: !0,
            list: [1, 2, 3, 4, 5]
        }
    }
});
```