# Project prompts

User-written prompts recovered from the main project conversation, followed by this publishing side chat. Wording is preserved. System instructions, tool outputs, account configuration and environment metadata are excluded. The redesign side-chat prompt was supplied directly by the user for inclusion. Any additional side chats not supplied or accessible are not reconstructed.

## 1. Main conversation

```text
can you find me the best mobile ui kits, bonus point if they are agent first, go through recent trendings on x etc, give me a plain list
```

## 2. Main conversation

```text
can you do audit of them, how many components and type of components there are, basically to understand the usecases they cover
```

## 3. Main conversation

```text
So now let's get started with building the design system. Let's go with the hero UI native one. Let's start fundamentally: start from the tokens for colors, typography, spacing, radius, and all of that. Let's start from there. Then map those tokens to the components and then we will use those basic components to build the bigger components like cards and all.
Lets keep it composable, also figure out the components that are not there in the hero one, give me a list of them, and then we build them also.
Our usecase is maonly finance realted, so audit the lib for that too, if it has all the components required. 

Use mobbin mcp to see fintech apps like wise, and see their components for benchmark
```

## 4. Main conversation

```text
So now let's get started with building the design system. Let's go with the hero UI native one. Let's start fundamentally: start from the tokens for colors, typography, spacing, radius, and all of that. Let's start from there. Then map those tokens to the components and then we will use those basic components to build the bigger components like cards and all.
Lets keep it composable, also figure out the components that are not there in the hero one, give me a list of them, and then we build them also.
Our usecase is maonly finance realted, so audit the lib for that too, if it has all the components required. 

Use mobbin mcp to see fintech apps like wise, and see their components for benchmark

Once done, give me a storybook like view so that I can see everything, play around with it and see if everythings there and workign as intended.
```

## Publishing side chat

```text
can you push it one my personal github and make it public, and attach a prompts.md and attach the prompts i have used here and in the other side chats.
```

## Design-system restructuring side chat

```text
Lets Think about restructuring this design system. Since we're rebuilding it visually, we have to think about a few things from the ground up:  
- radius
- spacing
- padding
- color
- typography
- micro-animations
  Since we're changing the vibe of it, we might have to tweak all of these. Restyling this component library to make it our own.
[https://in.pinterest.com/pin/75646468737337113/](https://in.pinterest.com/pin/75646468737337113/)
Take this as a reference. I dont want the components etc in design system to be fully rounded like it is right now. I want it to be just slightly rounded not fully sharp with 100% corner smoothing.
You cas reduce the padding a bit, keep generous spacing like it is right now. clean typography, less text sizes, do more with weights than size, keep 3 diff weights thats all.
I want the primary color to be green and the secondary button to be black. Then there can be gray versions of it. Make sure you make it work in both light and dark modes. 
Make sure to make components used in chat interfaces like thinking states(collapsed, diff thinking states, searching, analyzing etc.), like dislike, agent response, user query, prompt input(its states, default big one, smaller one when thread is long etc)
 
Crosscheck the ios and android guidlines. and make it handoff ready, remove all the slop, keep it simple, do an audit of code, there shouldnt be any orphan components, make sure styles are being followed and all.
```
