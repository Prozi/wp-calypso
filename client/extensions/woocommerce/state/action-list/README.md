# Action List

The Action List concept is one that is designed to help update an existing edit
state into a list of asynchronous actions that can be handled and tracked.


## Why do we need it?

For many of our data updates to the API, we need to handle multiple API requests
to bring our edit state to fruition on the server. This involves potentially a
series of creates, updates, and deletes.

Not only might we need to handle these in multiples (such as in bulk updates),
but some of these requests might be dependent upon others. For example, when
creating a Variable Product, one must first create the Product with an API call
before one can create the Variations for that Product, because each Variation API
call must include the Product ID (which is not present until the Product is
created.)


## What is it?

The action list is a structure that defines the steps needed to be executed.
It is passed from one action to the next until it is all complete.
The form of the action list changes to denote current state as it is passed on.

### Lifecycle

The action list starts out with a list of steps:
```
{
  nextSteps: [ step1, step2, step3, step4, step5 ],
}
```

As the first step starts, it is designated as the `currentStep`
```
{
  currentStep: step1,
  nextSteps: [ step2, step3, step4, step5 ],
}
```

Then after it completes, it moves to the `prevSteps` array.
```
{
  prevSteps: [ step1 ],
  currentStep: null,
  nextSteps: [ step2, step3, step4, step5 ],
}
```

Then step2 is started.
```
{
  prevSteps: [ step1 ],
  currentStep: step2,
  nextSteps: [ step3, step4, step5 ],
}
```

And so on...
```
{
  prevSteps: [ step1, step2 ],
  currentStep: null,
  nextSteps: [ step3, step4, step5 ],
}
```

Until all steps are complete.
```
{
  prevSteps: [ step1, step2, step3, step4, step5 ],
  currentStep: null,
  nextSteps: [],
}
```

### Step objects

Each step object consists initially of a description and an `onStep` event.

```
{ description: translate( 'Reticulating Splines' ), onStep: reticulateSplines }
```

Note that the description is designed for user display, so it should be translated.

The `onStep` function has two parameters that are passed to it:
```
function onStep( dispatch, actionList ) {}
```

The `dispatch` function can be used to send off actions to the system. These can
be thunks or asynchronous actions, anything that the store dispatch can handle.

The `actionList` parameter is the current state of the action list.

Note that it's the responsibility of `onStep` to eventually dispatch either the
step success action or step failure action after it is complete. This is crucial
to keeping the action list moving through its steps. The success or failure action
can be dispatched either immediately or asynchronously. It doesn't matter when it's
dispatched, only that it eventually is, or the action list stops.

After each step is started a `startTime` is assigned to it, and after the
step is completed via a success or failure, an `endTime` is assigned. If the
step failure action was used, an `error` is also assigned to the step, and the
list by default will not continue its execution.


### List Completion events

There are two completion events that can be used to send actions at the end
of the action list. One for success, and one for failure.

```
{
  prevSteps: [ step1 ],
  currentStep: step2,
  nextSteps: [ step3, step4, step5 ],

  onSuccess: notifySuccess,
  onFailure: notifyFailure,
}
```

Each event uses the same function signature as the step event functions:

```
function onSuccess( dispatch, actionList ) {}
function onFailure( dispatch, actionList ) {}
```

