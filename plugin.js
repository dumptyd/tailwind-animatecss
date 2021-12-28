/* -------------------- native imports -------------------- */
const fs = require('fs');
const path = require('path');

/* -------------------- node_module imports -------------------- */
const postcss = require('postcss');
const postcssJs = require('postcss-js');
const selectorParser = require('postcss-selector-parser');
const plugin = require('tailwindcss/plugin');

/* -------------------- utilities & constants -------------------- */

let CLASSNAME_PREFIX = 'animatecss'; // used to generate classes like `animatecss`, `animatecss-bounce`, etc.
const ANIMATECSS_BASE_SELECTOR = '.animated'; // what animatecss uses as its base class, it will be replaced by CLASSNAME_PREFIX by default
const ANIMATECSS_BASE_PATH = path.dirname(require.resolve('animate.css/package.json'));

/** returns absolute path to node_modules/animate.css */
const resolvePath = (pathStr = '') => path.resolve(ANIMATECSS_BASE_PATH, pathStr);
/** returns the base names of all directories inside the specified path */
const getDirsInDir = (pathStr) => fs.readdirSync(resolvePath(pathStr), { withFileTypes: true })
  .filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
/** returns the base names of all CSS files inside the specified path */
const getCSSFilesInDir = (pathStr) => fs.readdirSync(resolvePath(pathStr), { withFileTypes: true })
  .filter(dirent => dirent.isFile() && path.extname(dirent.name) === '.css').map(dirent => dirent.name);
/** transforms the raw CSS in the specified file and returns it in CSS-in-JS format */
const getStylesObjFromPath = (pathStr, { usePrefix = true } = {}) => {
  const cssString = fs.readFileSync(resolvePath(pathStr), 'utf-8');
  const ast = postcss.parse(cssString);
  const classSelectorProcessor = selectorParser((selectors) => {
    selectors.walkClasses((selector) => {
      // .animated (exact match, notice `selectors` usage) -> .animatecss
      if (selectors.toString() === ANIMATECSS_BASE_SELECTOR) selector.replaceWith(selectorParser.className({ value: CLASSNAME_PREFIX }));
      // .animated.something -> .something
      // why: tailwind includes all selectors matching `.animated.{whatever}` when using class "AND" selectors.
      // in this case, using .animatecss would result in tailwind bundling classes like .animated.repeat-1/2/3 and all
      // the other ones defined in _base.css.
      else if (selector.toString() === ANIMATECSS_BASE_SELECTOR) selector.remove();
      // generally the prefix should be included in the selectors, which will be the case for generic utilities like
      // `infinite`, `repeat-1`, etc. This will be used for those cases - .infinite -> .animatecss-infinite
      else if (usePrefix) selector.replaceWith(selectorParser.className({ value: `${CLASSNAME_PREFIX}-${selector.toString().slice(1)}` }));
      // (continued from above) But animations have two elements - keyframe animation and the corresponding utility class.
      // the goal here is to make tailwind understand the association and this is done using `matchUtilities` which requires
      // un-prefixed classes as the prefix is added by tailwind. For those cases, do not do anything and return the un-prefixed selector
      else { /* leave untouched */ }
    });
  });
  ast.walkRules(rule => {
    rule.selector = classSelectorProcessor.processSync(rule.selector).toString();
  });
  return postcssJs.objectify(ast);
};

/* -------------------- animate.css file processors -------------------- */

/** registers CSS variables from _vars.css as base styles */
const processVars = (addUtilities) => {
  const rules = getStylesObjFromPath('source/_vars.css');
  addUtilities(rules);
};

/** registers generic animation utilities from _base.css as tailwind utilities under the configured prefix */
const processUtilities = (addUtilities) => {
  const rules = getStylesObjFromPath('source/_base.css');
  addUtilities(rules);
};

/**
 * registers animations from animation directories inside `source/` as utilities under the configured prefix
 * and associates the keyframes to their corresponding class for purging
 */
const processAnimations = (matchUtilities) => {
  const animationDirnames = getDirsInDir('source');
  const animations = [];
  animationDirnames.forEach(dirname => {
    const basePath = `source/${dirname}`;
    const animationsInDir = getCSSFilesInDir(basePath).map(filename => ({
      name: path.basename(filename, '.css'),
      rules: getStylesObjFromPath(`${basePath}/${filename}`, { usePrefix: false })
    }));
    animations.push(...animationsInDir);
  });

  const animationRulesLookup = animations.reduce((acc, animation) => {
    const ruleSelector = `.${animation.name}`;
    const combinedKeyframesAndRule = {
      ...animation.rules,
      ...animation.rules[ruleSelector] // move the rules outside the selector
    };
    delete combinedKeyframesAndRule[ruleSelector]; // and delete the selector
    return { ...acc, [animation.name]: combinedKeyframesAndRule };
  }, {});
  matchUtilities({
    [CLASSNAME_PREFIX]: (rules) => rules
  }, {
    values: animationRulesLookup
  });
};

/* -------------------- glue & export -------------------- */

const main = ({ addUtilities, matchUtilities, theme }) => {
  CLASSNAME_PREFIX = theme('animatecss.prefix') || CLASSNAME_PREFIX;
  processVars(addUtilities);
  processUtilities(addUtilities);
  processAnimations(matchUtilities);
};

module.exports = plugin(main);
