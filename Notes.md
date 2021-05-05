# Notes

inspired by <https://www.sudokuwiki.org>

1. `setState` updates asynchronously
    1. If you need the _latest_ state, use a callback instead of an object
    1. Or for setting state based on previous state
1. Backspace/Delete(/Clear) deletes all the candidates
1. Shift+\<Delete> just resets a cell
1. Using IDs to identify elements since that's what IDs are for
1. Current IDs:
    1. `Aside` in `App`
    1. `Data` in `App > Main`
1. Render is asynchronous...
1. <https://developer.mozilla.org/en-US/docs/Web/API/Document/keydown_event> (keypress is deprecated - but it's a better name)
1. <https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/beforeinput_event>
1. css variables in Main are used by child elements

## List of bugs

Putting them here so that I can add tests for them later.
Tests for discovered bugs are said to be useful by some source I can't remember so which has no ... whatever. Anyways here they are:

1. Trying to setup strategies (css) [fixed]
    1. So I wanted the checkbox to be before the ordered integers
    2. and also for a tooltip to display and be positioned
    3. and then the strategy statuses had to line up
2. Cell updates:
    1. Didn't trigger since the coords were blocking the way [fixed]
    2. Then I discovered that `keypress` doesn't apply on `Backspace` [fixed]
    3. There's another bug here that I forgot [fixed?]
    4. I also forgot to add the `Data` update on `Backsapce` [fixed]
    5. And now, press backspace, press 5, and the text `this.state.candidates[0]` shows up
