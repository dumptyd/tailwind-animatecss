const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const cssMatcher = require('jest-matcher-css');
const plugin = require('./plugin');

expect.extend({
  toMatchCSS: cssMatcher
});

const generatePluginCSS = (css, pluginOptions = {}) => {
  return postcss(
    tailwindcss({
      _cache_buster: Math.random(),
      corePlugins: false,
      plugins: [plugin],
      ...pluginOptions
    })
  ).process(css, {
    from: undefined
  }).then(result => result.css);
};

const rootStyles = `
  :root {
    --animate-duration: 1s;
    --animate-delay: 1s;
    --animate-repeat: 1
  }
`;

it('defines animate.css variables when utilities layer is used', async () => {
  const inp = `
    @tailwind utilities;
  `;
  const out = await generatePluginCSS(inp);
  expect(out).toMatchCSS(rootStyles);
});

it('generates the base utility class', async () => {
  const inp = `
    @tailwind utilities;
    .foo {
      @apply animatecss;
    }
  `;
  const out = await generatePluginCSS(inp);
  expect(out).toMatchCSS(`
    ${rootStyles}
    .foo {
      animation-duration: var(--animate-duration);
      animation-fill-mode: both;
    }
    @media print, (prefers-reduced-motion: reduce) {
      .foo {
        animation-duration: 1ms;
        transition-duration: 1ms;
        animation-iteration-count: 1;
      }
    }
  `);
});

it('generates generic utility classes', async () => {
  // testing for one of each type
  const inp = `
    @tailwind utilities;
    .foo-infinite { @apply animatecss-infinite; }
    .foo-repeat-1 { @apply animatecss-repeat-1; }
    .foo-delay-1s { @apply animatecss-delay-1s; }
    .foo-fast { @apply animatecss-fast; }
  `;
  const out = await generatePluginCSS(inp);
  expect(out).toMatchCSS(`
    ${rootStyles}
    .foo-infinite {
      animation-iteration-count: infinite;
    }
    .foo-repeat-1 {
      animation-iteration-count: var(--animate-repeat);
    }
    .foo-delay-1s {
      animation-delay: var(--animate-delay);
    }
    .foo-fast {
      animation-duration: calc(var(--animate-duration) * 0.8);
    }
  `);
});

it('generates animation classes and keyframes', async () => {
  const inp = `
    @tailwind utilities;
    .foo { @apply animatecss-flash; }
  `;
  const out = await generatePluginCSS(inp);
  expect(out).toMatchCSS(`
    ${rootStyles}
    @keyframes flash {
      from, 50%, to {
        opacity: 1;
      }

      25%, 75% {
        opacity: 0;
      }
    }
    .foo {
      animation-name: flash;
    }
  `);
});


it('generates classes for all animations supported at the time of writing this test', async () => {
  const animations = [
    'bounce', 'flash', 'headShake', 'heartBeat', 'jello', 'pulse', 'rubberBand', 'shake', 'shakeX', 'shakeY', 'swing', 'tada',
    'wobble', 'backInDown', 'backInLeft', 'backInRight', 'backInUp', 'backOutDown', 'backOutLeft', 'backOutRight', 'backOutUp',
    'bounceIn', 'bounceInDown', 'bounceInLeft', 'bounceInRight', 'bounceInUp', 'bounceOut', 'bounceOutDown', 'bounceOutLeft',
    'bounceOutRight', 'bounceOutUp', 'fadeIn', 'fadeInBottomLeft', 'fadeInBottomRight', 'fadeInDown', 'fadeInDownBig',
    'fadeInLeft', 'fadeInLeftBig', 'fadeInRight', 'fadeInRightBig', 'fadeInTopLeft', 'fadeInTopRight', 'fadeInUp', 'fadeInUpBig',
    'fadeOut', 'fadeOutBottomLeft', 'fadeOutBottomRight', 'fadeOutDown', 'fadeOutDownBig', 'fadeOutLeft', 'fadeOutLeftBig',
    'fadeOutRight', 'fadeOutRightBig', 'fadeOutTopLeft', 'fadeOutTopRight', 'fadeOutUp', 'fadeOutUpBig', 'flip', 'flipInX',
    'flipInY', 'flipOutX', 'flipOutY', 'lightSpeedInLeft', 'lightSpeedInRight', 'lightSpeedOutLeft', 'lightSpeedOutRight',
    'rotateIn', 'rotateInDownLeft', 'rotateInDownRight', 'rotateInUpLeft', 'rotateInUpRight', 'rotateOut', 'rotateOutDownLeft',
    'rotateOutDownRight', 'rotateOutUpLeft', 'rotateOutUpRight', 'slideInDown', 'slideInLeft', 'slideInRight', 'slideInUp',
    'slideOutDown', 'slideOutLeft', 'slideOutRight', 'slideOutUp', 'hinge', 'jackInTheBox', 'rollIn', 'rollOut', 'zoomIn',
    'zoomInDown', 'zoomInLeft', 'zoomInRight', 'zoomInUp', 'zoomOut', 'zoomOutDown', 'zoomOutLeft', 'zoomOutRight', 'zoomOutUp'
  ];

  // eslint-disable-next-line no-restricted-syntax
  for (const animation of animations) {
    const inp = `
      @tailwind utilities;
      .foo { @apply animatecss-${animation}; }
    `;
    // eslint-disable-next-line no-await-in-loop
    const out = await generatePluginCSS(inp);
    expect(out).toContain(`@keyframes ${animation}`);
    expect(out).toContain(`animation-name: ${animation}`);
  }
});

/*
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
This has to be the last test because tailwind seems to have a cache invalidation bug and it continues to generate
styles with the custom prefix used in this test.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/
it('respects the prefix option for class generation', async () => {
  const inp = `
    @tailwind utilities;
    .foo { @apply custom-animation-flash custom-animation-infinite; }
  `;
  const out = await generatePluginCSS(inp, {
    theme: {
      animatecss: {
        prefix: 'custom-animation'
      }
    }
  });
  expect(out).toMatchCSS(`
    ${rootStyles}
    .foo {
      animation-iteration-count: infinite;
    }
    @keyframes flash {
      from, 50%, to {
        opacity: 1;
      }

      25%, 75% {
        opacity: 0;
      }
    }
    .foo {
      animation-name: flash;
    }
  `);
});
