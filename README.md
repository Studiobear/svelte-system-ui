<p align="left"><img src="./static/ssui-horiz-fat.svg" width="480" height="160" /></p>

# Svelte + System UI

#### Built with Svelte + Styled System + Goober + TypographyJS + SvDX(Svelte-flavored MDX — coming soon!)

---

**_Notice: Unstable API and under heavy development_**

[Svelte](https://svelte.dev/) is a UI development framework for creating boilerplate-free components that compile down to fast, virtual-DOM-free vanilla JS that is truly reactive.

[System UI](https://system-ui.com/) is an evolving standard for creating consistent, interoperable UIs. It is the underlying foundation to many UI-themeing libraries such as Styled System, Rebass, ThemeUI, and more. The main implementation of System UI is through [Styled System](https://styled-system.com/).

The motivation of this library is to bring the culture developing the standard of consistent, interoperable UIs — a.k.a. themeing — to Svelte. Svelte is still a young framework with many standards for managing complexity yet to be defined. However, there is no reason that Svelte cannot become a contributing member to this conversation.

**Elements**

- **[Styled System](https://styled-system.com/)**: Styled System is a collection of utility functions for forming style props based on a global theme object defining typographic and layout properties. An evolved alternative being explored is [xstyled](https://xstyled.dev/). While these libraries were built with React in mind, they are really CSS utilies that require binding to components via CSS-in-JS solutions. Bringing us to...
- **[Goober](https://github.com/cristianbote/goober)**: a less than 1kb CSS-in-JS implementation (toting in comparison ~16/11kb respectively of [styled-components](https://github.com/styled-components/styled-components)/[emotion](https://github.com/emotion-js/emotion). In this library, Goober's `css` function is used to parse and apply the style props formed by Styled System.
- **[Typography.js](http://kyleamathews.github.io/typography.js/)**: Typography is difficult and the nuances of applying good typography exasperate the already-brittle system of themes and CSS. TypographyJS works as a seperate themeing layer that can be integrated with Styled System to apply such typographic nuances to the greater theme.
- **SvDX _(coming soon)_**: Svelte-flavored MDX. MDX? MDX allows writing JSX (known for its use in React, but is a general syntax extension to JS) in Markdown documents. Long story short, as Markdown is [easy](https://www.markdownguide.org/getting-started/#why-use-markdown), it can be made even more powerful by allowing Svelte-components to be as easily embedded as JSX.

### Current State

This library is naively constructed as scrutiny and comprehension of the critical elements of css-in-js theming is underway.

# Using Svelte System UI

## Getting started

### The Theme

Themes are just JS objects and ideally, if you already have an existing theme from React using Theme-UI, then you can bring over your theme as is or [get a preset](https://theme-ui.com/demo).

**Example Theme Object:**

```jsx
export default {
  colors: {
    text: '#333',
    background: '#fff',
    primary: '#639',
    secondary: '#ff6347',
  },
  fonts: {
    body: 'system-ui, sans-serif',
    heading: 'system-ui, sans-serif',
    monospace: 'Menlo, monospace',
  },
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 72],
}
```

### Using your theme

Use `styled` from `svelte-system-ui` in a [svelte action](https://svelte.dev/docs#use_action) like so: `use:styled`. It expects an array in the form `[$$props, $theme]` note the `$` sign in front of your imported theme to ([automatically subscribe / unsubscribe to changes automatically!](https://svelte.dev/docs#4_Prefix_stores_with_$_to_access_their_values))

```jsx
// Box.svelte
<script>
  import { styled } from '@studiobear/svelte-system-ui';
  import { theme } from './theme.js';
</script>

<div use:styled={[$$props, $theme]}>
  <slot></slot>
</div>
```

That's all! Your are ready to use all css property names + [shorthand](#currently-available-shorthand-properties) props as attribute on your component! See [https://styled-system.com/api](https://styled-system.com/api) for more documentation.

```jsx
// App.svelte
<script>
  import Box from './Box.svelte';
</script>

<Box
  p={["space.s", "space.m", "space.l"]}
  bg="color.primary" color="color.secondary"
  textAlign="center"
>
  <h3>Using styled-system in svelte!</h3>
  <p>Resize me to see my responsive padding in action</p>
</Box>
```

### How does the value resolution work?

1. The attribute name will get mapped to the css property name. You can specify it either in camelCase `(textAlign)` or kebab-case `(text-align)`.
   So, if you know css by heart, you already know 99% of your component's props.

2. if the value is a string, `svelte-styled-system` first assumes it might be a keypath to your theme object. It uses [(dlv)](https://github.com/developit/dlv) under the hood. If the path can not be resolved, the the resolution will fallback to the input value. (input: `textAlign="center"` => center can not be found in the theme so the output is just `text-align: center;`)

```jsx
{
  color: {
    primary: "dodgerblue", // path: color.primary
  },
  // path: scale.0 => 0
  // path: scale.1 => 0.5rem
  // path: scale.2 => 1rem
  scale: ["0", "0.5rem", "1rem"]
}
```

3. if the value is an array then `svelte-styled-system` will create a media query for each breakpoint and will resolve the separate values just as described before.
   `padding: [0, "space.m", "space.l"]`:

- will create `padding: 0;` (raw value) for `theme.breakpoints[0]`
- will create `padding: 1rem;` (`space.m`) for `theme.breakpoints[1]`
- will create `padding: 2rem;` (`space.l`) for `theme.breakpoints[2]`

## Currently available shorthand properties:

For commonly used css properties there are shortcuts to make your code _even less_ verbose.

**Example:**
`my="space.m"` => `margin-top: 1rem; margin-bottom: 1rem;`

As with all other properties you can use the responsive Array notation as well!
A complete list of shorthand props is available in the (chakra-ui docs)[https://chakra-ui.com/style-props] or at (src/constants.js)[src/constants.js]

**Note**: Shorthand path resolutions ("theme keys") are not supported yet. So you always have to specify the full object path:

```jsx
// react styled-system:
<MyComponent bg="primary" />

// svelte-styled-system:
<MyComponent bg="color.primary" />
```

# Acknowledgements

This library was initially inspired by [svelte-styled-system(@manuschillerdev)](https://github.com/manuschillerdev/svelte-styled-system). At time of discovery, svelte-styled-system was annotated as a proof-of-concept for bringing in the concepts of [styled-system](https://styled-system.com/) and doing it in as small of a package as possible. SSUI vears away from this by choosing to directly integrate with the styled-system ecosystem, at the cost of size optimization, yet increase compatibality with themes builts for mainly React-based projects.
