# tailwind-animatecss

Use animate.css as a Tailwind 3 plugin.

**Demo** &ndash; https://dumptyd.github.io/tailwind-animatecss

### Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Advanced](#advanced)
  - [Changing the prefix](#changing-the-prefix)
  - [How this plugin differs from other implementations](#how-this-project-differs-from-other-implementations)

### Installation

```sh
yarn add tailwind-animatecss animate.css
# OR
npm install tailwind-animatecss animate.css
```

Specify the plugin in `tailwind.config.js`

```js
module.exports = {
  // ...
  plugins: [
    require('tailwind-animatecss')
  ],
  // ...
};
```

### Usage

Animations can be applied using `animatecss` prefixed classes:

```html
<h1 class="animatecss animatecss-bounce">Bouncy!</h1>
<h1 class="animatecss animatecss-slideInDown">Sliding in</h1>
<h1 class="animatecss animatecss-jackInTheBox">Jack in the box</h1>
```

---

All animate.css classes are modified to use the `animatecss` class name and prefix to avoid conflicts with Tailwind's animations. The table below should give you an idea of how the classes are mapped to the prefix.

| animate.css | tailwind-animatecss |
| - | - |
| `animate__animated` | `animatecss` |
| `animate__fadeIn` | `animatecss-fadeIn` |
| `animate__infinite` | `animatecss-infinite` |
| `animate__repeat-2` | `animatecss-repeat-2` |
| `animate__delay-2s` | `animatecss-delay-2s` |
| `animate__fast` | `animatecss-fast` |
| | ... and so on |

### Advanced

#### Changing the prefix

By default, `animatecss` is used as the base class name and prefix for classes. This can be changed by specifying the `theme.animatecss.prefix` option in `tailwind.config.js`.

```js
module.exports = {
  // ...
  theme: {
    animatecss: {
      prefix: 'custom-animation'
    }
  }
  // ...
};
// class names will now be available under
// `custom-animation`, `custom-animation-bounce`, `custom-animation-infinite` and so on.
```

#### How this plugin differs from other implementations

Unlike other projects, this plugin doesn't implement the animations through a rewrite of the animate.css utilities.

Instead, classes, keyframes and styles are read from your installed version of animate.css at compile time and these are registered with Tailwind so the animations can be used with purging support, IntelliSense and other Tailwind goodness.

### Contributing

https://github.com/dumptyd/tailwind-animatecss/issues

### License

MIT
