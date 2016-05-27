# Example

Here we show more advanced examples of using dangit in action, by replicating some weird situations it was designed to help you cope with.

**describe()** - for when you need a human friendly type checker

```js
const input = document.querySelector('a');
dangit.describe(input);  // => if successful, 'HTML Anchor Element'
```
