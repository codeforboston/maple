# Storybook

## References

### background

The storybook site: https://storybook.js.org/

### documentation

The docs from the source: https://storybook.js.org/docs/6.5/get-started/install

**NOTE**: We are on storybook version 6.5, so make sure you are looking at the 6.5 docs and not the 7.x (current version) docs. There is some pretty different syntax among other updates. We hope to version up soon.

## Using storybook

Launch storybook by running `yarn storybook` on the command line and going to localhost:6006 in the browser.

## Reasoning

### why storybook?

This is a versitile, very useful tool for ui development, which developers on our team at time of set up knew and preferred. It is well supported, popular, has great documentation, and many useful integrations.

> ### [why story book (quoted from storybook site)?](https://storybook.js.org/docs/6.5/get-started/why-storybook)
>
> #### Build UIs in isolation
>
> Every piece of UI is now a component. The superpower of components is that you don't need to spin up the whole app just to see how they render. You can render a specific variation in isolation by passing in props, mocking data, or faking events.
>
> Storybook is packaged as a small, development-only, workshop that lives alongside your app. It provides an isolated iframe to render components without interference from app business logic and context. That helps you focus development on each variation of a component, even the hard-to-reach edge cases.
>
> #### Capture UI variations as “stories”
>
> When developing a component variation in isolation, save it as a story. Stories are a declarative syntax for supplying props and mock data to simulate component variations. Each component can have multiple stories. Each story allows you to demonstrate a specific variation of that component to verify appearance and behavior.
>
> You write stories for granular UI component variation and then use those stories in development, testing, and documentation.
