/**
 * What Aluna offers after a check-in, keyed by sub-category.
 *
 * These are written down rather than generated. An API would mean sending the
 * user's emotional state to a third party on every check-in — the precise data
 * the end-to-end encryption exists to keep from leaving the device. No amount
 * of prompt engineering makes that trade worth it, and the encryption promise
 * on the signup screen would become a lie the moment it shipped.
 *
 * Fixed text also means every word can be reviewed before anyone reads it,
 * which matters on a subject where a confidently wrong sentence lands hard.
 *
 * Tone rules these follow:
 *   - Describe the feeling before suggesting anything. Being understood first
 *     is most of the value.
 *   - Suggest, never instruct. No "you should", no promised outcomes.
 *   - Nothing clinical. These are ordinary things people do, not treatment.
 *   - Pleasant feelings get noticing, not fixing. Nothing here treats joy as a
 *     problem to manage.
 */

export interface Strategy {
  title: string;
  body: string;
}

export interface Guidance {
  heading: string;
  description: string;
  strategies: Strategy[];
}

export const GUIDANCE: Record<string, Guidance> = {
  /* ---------------- Happy ---------------- */
  "happy.playful": {
    heading: "Feeling playful",
    description:
      "There is energy here that is not going anywhere in particular, and that is the point of it. Playfulness tends to arrive when you are not being watched or measured.",
    strategies: [
      { title: "Follow it while it lasts", body: "Playfulness does not keep. Whatever it wants to do next — a detour, a silly message, a tangent — is worth doing now rather than scheduling." },
      { title: "Notice who you were with", body: "It rarely appears at random. If someone or somewhere brought it on, that is useful information about where to spend more time." },
      { title: "Resist making it productive", body: "The instinct to turn a good mood into output usually ends it. Let this one be for nothing." },
    ],
  },
  "happy.content": {
    heading: "Feeling content",
    description:
      "Nothing is missing right now. Contentment is quieter than joy and easier to overlook, which is why it often goes unrecorded.",
    strategies: [
      { title: "Sit in it for a minute", body: "Contentment passes without announcing itself. A deliberate minute of noticing is usually all it asks." },
      { title: "Name what is enough", body: "Try naming the specific things that are currently sufficient. It is a short list more often than you expect." },
      { title: "Do not go looking for more", body: "The urge to improve a good moment is what usually ends it. This one does not need anything added." },
    ],
  },
  "happy.interested": {
    heading: "Feeling interested",
    description:
      "Something has your attention on its own merits, without you having to push. Curiosity is a reliable sign that you are pointed somewhere worth going.",
    strategies: [
      { title: "Go one layer deeper now", body: "Interest is perishable. One more question, article or conversation while it is live is worth ten later." },
      { title: "Write down the question", body: "Not the answer — the question. It will be harder to reconstruct than you think." },
      { title: "Notice what triggered it", body: "Curiosity has patterns. Knowing which conditions produce it makes it less a matter of luck." },
    ],
  },
  "happy.proud": {
    heading: "Feeling proud",
    description:
      "Something went well and you had a hand in it. Pride is often deflected faster than it is felt, especially by people who are hard on themselves.",
    strategies: [
      { title: "Take the credit", body: "Before listing who helped or what was luck, name your own part plainly. You can be accurate and generous afterwards." },
      { title: "Be specific about what you did", body: "\“It went well\” fades. \“I kept going when it was dull\” is something you can draw on next time." },
      { title: "Tell one person", body: "Not for praise — saying it out loud makes it harder to quietly discount later." },
    ],
  },
  "happy.accepted": {
    heading: "Feeling accepted",
    description:
      "You are somewhere you do not have to perform. That is rarer than it should be, and worth marking when it happens.",
    strategies: [
      { title: "Notice what you stopped doing", body: "Acceptance usually shows up as effort you did not have to make. Which version of yourself did you not have to run?" },
      { title: "Say it to them", body: "People rarely know they have given someone this. It costs a sentence to tell them." },
      { title: "Use it as a reference point", body: "Remember how this feels. It makes it easier to recognise rooms where you are performing." },
    ],
  },
  "happy.powerful": {
    heading: "Feeling powerful",
    description:
      "You feel capable of acting on things rather than only reacting to them. This state is a good moment for decisions that a flatter day would defer.",
    strategies: [
      { title: "Spend it on something that has been waiting", body: "Capability is a resource with a short shelf life. The hard email, the postponed decision — now, not later." },
      { title: "Do not overcommit", body: "Confidence tends to say yes to more than the ordinary version of you can carry. Check the calendar before promising." },
      { title: "Note what built it", body: "Rest, a win, the right people. Knowing the ingredients makes this less random." },
    ],
  },
  "happy.peaceful": {
    heading: "Feeling peaceful",
    description:
      "Nothing is pulling at you. Peace is easily interrupted and rarely defended, which is most of why it feels rare.",
    strategies: [
      { title: "Protect the next ten minutes", body: "The most common thing that ends peace is voluntarily picking up a phone. Consider not, for now." },
      { title: "Register the conditions", body: "Where you are, what you have and have not done today. Peace is more repeatable than it looks." },
      { title: "Let it be uneventful", body: "There is nothing to do with this feeling. That is not a waste." },
    ],
  },
  "happy.trusting": {
    heading: "Feeling trusting",
    description:
      "Your guard is down and that feels all right rather than dangerous. Trust takes a long time to build and is worth noticing when it is present.",
    strategies: [
      { title: "Notice how the body feels", body: "Trust registers physically — shoulders, jaw, breathing. That is a signal you can learn to read elsewhere." },
      { title: "Say one true thing", body: "Trust grows by being used. A slightly more honest sentence than you would normally risk is usually enough." },
      { title: "Do not audit it", body: "The urge to check whether trust is deserved often does more damage than the risk it is guarding against." },
    ],
  },
  "happy.optimistic": {
    heading: "Feeling optimistic",
    description:
      "The future looks workable from here. Optimism is not naivety; it is a mood that makes starting things possible.",
    strategies: [
      { title: "Start something small today", body: "Optimism is best spent on a first step rather than a plan. Plans survive the mood ending; momentum does not." },
      { title: "Write the version you can believe now", body: "You will read it on a flatter day, and it will be useful precisely because you did not write it then." },
      { title: "Keep the scope honest", body: "Optimism inflates timelines. Halve what you think you can do and you will still be ahead." },
    ],
  },

  /* ---------------- Surprised ---------------- */
  "surprised.excited": {
    heading: "Feeling excited",
    description:
      "Something ahead has your energy pointed at it. Excitement is close to anxiety in the body — the difference is mostly whether you want the thing.",
    strategies: [
      { title: "Move it through the body", body: "Excitement that has nowhere to go turns jittery. Walk, stretch, do something physical for two minutes." },
      { title: "Say it to someone", body: "Anticipation shared tends to hold better than anticipation contained." },
      { title: "Give the plan one honest look", body: "Not to dampen it. Excitement is a good time to notice the one thing that will need doing anyway." },
    ],
  },
  "surprised.amazed": {
    heading: "Feeling amazed",
    description:
      "Something was larger or stranger or better than you expected. Awe reliably makes ordinary worries feel smaller for a while.",
    strategies: [
      { title: "Stay with it before explaining it", body: "The instinct to analyse arrives fast and tends to shrink the thing. Give it a minute first." },
      { title: "Record enough to return to", body: "A sentence now will bring the whole thing back later. Photographs rarely do." },
      { title: "Notice the recalibration", body: "Awe tends to resize whatever you were worrying about. Check whether it still looks the same size." },
    ],
  },
  "surprised.confused": {
    heading: "Feeling confused",
    description:
      "Something does not fit what you expected, and the gap has not resolved. Confusion is uncomfortable but it is also the honest response to genuinely unclear information.",
    strategies: [
      { title: "Write down what you actually know", body: "Separating fact from inference usually shrinks confusion to a much smaller and more specific question." },
      { title: "Resist premature certainty", body: "The discomfort tempts you into any explanation. A wrong one is harder to undo than an open question." },
      { title: "Ask the person directly", body: "Most confusion about other people dissolves in one conversation and survives weeks of speculation." },
    ],
  },
  "surprised.startled": {
    heading: "Feeling startled",
    description:
      "Something landed before you were ready for it. The body reacts to surprise long before the mind decides whether it mattered.",
    strategies: [
      { title: "Let the body finish first", body: "A startle response runs for a couple of minutes. Decisions made inside that window are rarely your best." },
      { title: "Lengthen the out-breath", body: "Slowing the exhale is the fastest lever available on a system that has just spiked." },
      { title: "Separate the shock from the news", body: "How badly something startled you is not a measure of how bad it is. Reassess once you have settled." },
    ],
  },

  /* ---------------- Disgusted ---------------- */
  "disgusted.disapproving": {
    heading: "Feeling disapproving",
    description:
      "Something has fallen short of a standard you hold, and you find yourself judging it. Disapproval carries useful information about your values and very little about what to do next.",
    strategies: [
      { title: "Find the value underneath", body: "Disapproval always sits on top of something you care about. Naming it turns a judgement into something you can act on." },
      { title: "Ask if it is yours to hold", body: "Some standards are genuinely yours; others were handed to you. Worth knowing which this one is." },
      { title: "Decide whether to say anything", body: "Silent disapproval curdles. Either raise it or let it go, but choose deliberately rather than by default." },
    ],
  },
  "disgusted.disappointed": {
    heading: "Feeling disappointed",
    description:
      "Reality did not match what you were expecting, and the gap is uncomfortable. Disappointment is grief in miniature — for the version that did not happen.",
    strategies: [
      { title: "Let it be a small loss", body: "The instinct is to minimise it. Naming it as a genuine loss, however small, tends to let it pass faster than dismissing it." },
      { title: "Check the expectation", body: "Some disappointments come from the world; others from a forecast that was never realistic. Both are worth knowing about." },
      { title: "Do not rush to the lesson", body: "There may not be one. Sometimes things simply do not go the way you hoped." },
    ],
  },
  "disgusted.awful": {
    heading: "Feeling awful",
    description:
      "Something feels genuinely repellent, possibly including how you see yourself right now. Shame and disgust turned inward are among the hardest states to think clearly from.",
    strategies: [
      { title: "Separate the act from the person", body: "“I did something bad” and “I am bad” feel identical from inside and are entirely different. Only the first can be acted on." },
      { title: "Say it out loud to someone safe", body: "Shame is unusually dependent on secrecy. It rarely survives being spoken to a person who does not recoil." },
      { title: "Postpone the verdict", body: "Whatever conclusion you are reaching about yourself, it does not have to be reached today." },
    ],
  },
  "disgusted.repelled": {
    heading: "Feeling repelled",
    description:
      "Something has produced a strong aversion, and the body reacted before you decided anything. Revulsion is fast, physical and not always about what it seems to be about.",
    strategies: [
      { title: "Get physical distance", body: "Revulsion does not respond to reasoning while the thing is still in front of you. Leave the room first." },
      { title: "Reset the senses", body: "Fresh air, cold water, a strong taste. Aversion is a sensory state and often clears through the senses." },
      { title: "Ask what it is protecting", body: "Disgust evolved to keep us away from harm. Sometimes it is right, sometimes it has misfired — worth asking which, later." },
    ],
  },

  /* ---------------- Sad ---------------- */
  "sad.hurt": {
    heading: "Feeling hurt",
    description:
      "Something someone did landed painfully. Hurt often arrives dressed as anger because anger is easier to act on, but underneath it is usually simpler than that.",
    strategies: [
      { title: "Call it hurt, not anger", body: "Naming it accurately changes what you do next. Anger wants retaliation; hurt wants acknowledgement, and those lead very different places." },
      { title: "Decide what you actually want", body: "An apology, an explanation, distance, or nothing at all. Knowing which makes the conversation possible." },
      { title: "Do not decide the relationship today", body: "Hurt makes everything feel like evidence of a pattern. Give it a few days before concluding." },
    ],
  },
  "sad.depressed": {
    heading: "Feeling low",
    description:
      "Things feel flat, heavy, or not worth the effort. Low mood is convincing precisely because it presents itself as clear-eyed realism rather than as a mood.",
    strategies: [
      { title: "Lower the bar and act anyway", body: "Waiting to feel like it usually does not work. Doing a much smaller version of something is the reliable order of operations." },
      { title: "Treat the conclusions as symptoms", body: "“Nothing matters” and “this will not change” are things low mood says. They are not findings." },
      { title: "Tell one person how it actually is", body: "Not for advice. Low mood isolates, and being accurately known by one person interrupts that." },
    ],
  },
  "sad.guilty": {
    heading: "Feeling guilty",
    description:
      "You believe you did something wrong and it is sitting heavily. Guilt is useful when it points at a repair and corrosive when it just circles.",
    strategies: [
      { title: "Work out if there is a repair", body: "If there is something to say or fix, guilt has done its job and the rest is action. If there is not, it is only punishment." },
      { title: "Check the proportion", body: "Guilt is often much larger than the thing. Ask what you would say to a friend who had done exactly this." },
      { title: "Make the amends once", body: "Apologise properly, once. Repeated apologising serves your discomfort more than the other person." },
    ],
  },
  "sad.despair": {
    heading: "Feeling hopeless",
    description:
      "It feels as though nothing will change and there is nothing to be done. Despair narrows the view until only this moment is visible, which is exactly what makes it so convincing.",
    strategies: [
      { title: "Shorten the horizon", body: "Not the week or tomorrow. The next hour, and something small and concrete inside it." },
      { title: "Do not trust the forecast", body: "Despair predicts permanence and is unreliable at it. You have felt differently before, even if that is hard to reach right now." },
      { title: "Tell someone today", body: "This is the state that most needs another person and most argues against reaching for one. If you are thinking about harming yourself, please contact a crisis line — there are numbers under Help." },
    ],
  },
  "sad.vulnerable": {
    heading: "Feeling vulnerable",
    description:
      "You feel exposed, without your usual defences. Vulnerability is uncomfortable and is also the state in which most real connection happens.",
    strategies: [
      { title: "Choose who sees it", body: "Vulnerability is not owed to everyone. Being deliberate about who gets it is the difference between openness and exposure." },
      { title: "Ask for something specific", body: "“Can you just listen for ten minutes” is easier to give and to receive than an unnamed need." },
      { title: "Reduce the load elsewhere", body: "When defences are down, this is not the day for difficult admin or hard conversations you can postpone." },
    ],
  },
  "sad.lonely": {
    heading: "Feeling lonely",
    description:
      "There is a gap between the connection you have and the connection you want. Loneliness is not the same as being alone, which is why it can be sharpest in a full room.",
    strategies: [
      { title: "Reach out below the bar", body: "Loneliness sets an impossibly high standard for what counts as worth contacting someone. Send the low-effort message anyway." },
      { title: "Choose depth over volume", body: "One honest conversation resolves more than a day of pleasant company. Pick the person you can be actual with." },
      { title: "Be somewhere with people in it", body: "A café, a walk, a library. Not a substitute for connection, but it reliably takes the edge off while you find some." },
    ],
  },

  /* ---------------- Fearful ---------------- */
  "fearful.scared": {
    heading: "Feeling scared",
    description:
      "Something feels threatening and the body has responded ahead of any decision. Fear is fast and rarely proportionate — it errs towards over-reacting because that has historically been cheaper than under-reacting.",
    strategies: [
      { title: "Get the body down first", body: "Slow the out-breath, put both feet flat, name five things in the room. Reasoning with fear before the body settles rarely works." },
      { title: "Ask what it is predicting", body: "Fear deals in vague catastrophe. Forcing it to name a specific prediction usually reveals how much is assumption." },
      { title: "Do not decide anything yet", body: "Fear is a terrible advisor on irreversible choices. If it can wait an hour, let it." },
    ],
  },
  "fearful.anxious": {
    heading: "Feeling anxious",
    description:
      "Your mind is running ahead into what might go wrong, and the body is preparing for all of it at once. Anxiety feels like vigilance but functions mostly as noise.",
    strategies: [
      { title: "Put it on paper", body: "Anxiety loops because held thoughts have nowhere to end. Written down, the same worries stop circling and start looking finite." },
      { title: "Separate what you can act on", body: "Split the list into things you could do something about today and things you could not. Then only look at the first column." },
      { title: "Give it a time and a place", body: "Deferring worry to a set fifteen minutes later today sounds artificial and works more often than it should." },
    ],
  },
  "fearful.insecure": {
    heading: "Feeling insecure",
    description:
      "You are measuring yourself against something and coming up short. Insecurity tends to compare your inside with other people's outside, which is not a fair comparison and never was.",
    strategies: [
      { title: "Check what you are comparing against", body: "Usually a highlight reel, an idealised version, or a past self remembered generously. Name the actual standard and it often stops holding." },
      { title: "Find the specific evidence", body: "“I am not good enough” resists argument. “I handled that badly on Tuesday” can actually be examined, and usually shrinks." },
      { title: "Do something you are competent at", body: "Competence is easier to feel than to argue yourself into. Anything you are reliably decent at will do." },
    ],
  },
  "fearful.weak": {
    heading: "Feeling insignificant",
    description:
      "You may feel as though you are fading into the background, as if your presence does not register with the people around you. That often comes with a painful belief that you are not worth connecting with, which makes reaching out feel pointless at exactly the moment it would help.",
    strategies: [
      { title: "Small, achievable routines", body: "A daily walk, a proper meal, fifteen minutes on something of your own. These restore a sense of agency, which is what insignificance erodes first." },
      { title: "Question the thought directly", body: "Ask what evidence there is for “I do not matter here”, and what else could explain the same situation. Then find one occasion when you clearly did." },
      { title: "Do something small for someone", body: "A genuine compliment, an offer of help. It turns attention outward and quietly contradicts the belief that you are not worth much." },
    ],
  },
  "fearful.rejected": {
    heading: "Feeling rejected",
    description:
      "You have been left out, turned down, or simply not chosen, and it stings well out of proportion to the event. Social exclusion registers in the body much like physical pain, which is why it is not something you can simply reason away.",
    strategies: [
      { title: "Let it hurt before interpreting it", body: "Rejection wants an immediate explanation, and the fastest one available is usually about your worth. Feel it first; conclude later." },
      { title: "Look for other explanations", body: "Most exclusions are about timing, capacity or someone else's circumstances. That is rarely the first story that arrives." },
      { title: "Go where you already belong", body: "Not to prove anything — contact with people who already want you around is the fastest thing that resets this." },
    ],
  },
  "fearful.threatened": {
    heading: "Feeling threatened",
    description:
      "Something feels like it could take away your safety, standing or footing. Whether or not the threat is real, the vigilance it produces is exhausting to sustain.",
    strategies: [
      { title: "Establish what is actually at risk", body: "Threat generalises quickly. Naming the specific thing that could be lost usually makes it both smaller and more manageable." },
      { title: "Find the part you control", body: "There is almost always one. Acting on it changes the feeling more than resolving the whole situation would." },
      { title: "Tell someone", body: "Threat isolates by design. Saying it out loud to one person reliably reduces its size." },
    ],
  },

  /* ---------------- Angry ---------------- */
  "angry.let-down": {
    heading: "Feeling let down",
    description:
      "Someone did not do what you were relying on them to do. Disappointment in people we trust cuts differently than disappointment in general — it comes with a question about the relationship.",
    strategies: [
      { title: "Separate the act from the pattern", body: "Once is a lapse; repeatedly is information. Deciding which this is changes what the right response looks like." },
      { title: "Say it plainly, once", body: "Unspoken let-downs accumulate into resentment. One clear sentence about what you expected is usually enough." },
      { title: "Notice what you assumed", body: "Some expectations were never actually agreed. That does not make the feeling wrong, but it changes the conversation." },
    ],
  },
  "angry.humiliated": {
    heading: "Feeling humiliated",
    description:
      "You were diminished in front of others, or feel you were. Humiliation combines anger with shame, which is why it replays so persistently and resists being talked out of.",
    strategies: [
      { title: "Do not respond today", body: "Almost everything humiliation wants to do makes it worse. Whatever it is, it will still be available tomorrow." },
      { title: "Check who actually noticed", body: "The audience in your memory is usually far larger and more attentive than the one that was there." },
      { title: "Tell one person you trust", body: "Humiliation depends on being kept secret. Saying it aloud to someone safe takes most of the charge out." },
    ],
  },
  "angry.bitter": {
    heading: "Feeling bitter",
    description:
      "Something unfair happened and it has not settled. Bitterness is anger that has been held too long without anywhere to go, and it costs the person holding it the most.",
    strategies: [
      { title: "Name the unfairness precisely", body: "Bitterness generalises into a worldview. Returning it to the specific thing that happened makes it something you can actually address." },
      { title: "Decide whether action is available", body: "If something can be said or changed, do that. If not, the work is grief rather than justice, and that is different work." },
      { title: "Notice the cost of carrying it", body: "Not as an argument for letting go — just an honest accounting of what holding it takes from you each day." },
    ],
  },
  "angry.mad": {
    heading: "Feeling furious",
    description:
      "Anger is at full volume and wants to be acted on immediately. That urgency is the least trustworthy part of it.",
    strategies: [
      { title: "Move first", body: "Anger is physical. Walking, stairs, anything hard for two minutes lets the body finish what it started." },
      { title: "Do not send it", body: "Write the message if it helps. Then leave it unsent until tomorrow, when you will edit it and be glad." },
      { title: "Find the line that was crossed", body: "Fury usually points at a boundary or value that matters. That is worth knowing once the volume drops." },
    ],
  },
  "angry.aggressive": {
    heading: "Feeling aggressive",
    description:
      "There is an urge to push back hard, and it feels justified. Aggression is often fear or hurt with its armour on.",
    strategies: [
      { title: "Put distance between you and the trigger", body: "Physically leaving the situation for ten minutes is not avoidance. It is the cheapest way to keep it from escalating." },
      { title: "Ask what is underneath", body: "Aggression is rarely the first feeling. Fear, hurt or humiliation usually got there before it." },
      { title: "Discharge it somewhere harmless", body: "Exercise, loud music, hard cleaning. It needs an outlet, and the choice of outlet is the whole thing." },
    ],
  },
  "angry.frustrated": {
    heading: "Feeling frustrated",
    description:
      "Something is blocked and effort is not shifting it. Frustration is what happens when persistence stops paying and you keep persisting anyway.",
    strategies: [
      { title: "Stop before you push harder", body: "The instinct is more effort. Frustration is usually a signal that the approach is wrong, not that the effort is insufficient." },
      { title: "Step away for ten minutes", body: "Genuinely away. The solution arriving in the shower is a cliché because the mechanism is real." },
      { title: "Ask whether it needs doing", body: "Some blocked things are blocked because they were not worth it. That is worth checking before pushing again." },
    ],
  },
  "angry.distant": {
    heading: "Feeling distant",
    description:
      "You have pulled back and everything feels slightly muffled. Numbness is often protective — it usually arrives when feeling things fully has become too expensive.",
    strategies: [
      { title: "Treat it as protection, not failure", body: "Distance shows up for a reason. Asking what it is shielding you from is more useful than trying to force feeling." },
      { title: "Start with the body", body: "Cold water, a walk, something with texture or taste. Sensation is usually easier to reach than emotion from here." },
      { title: "Make one small contact", body: "A message to one person, however brief. Distance deepens on its own if nothing interrupts it." },
    ],
  },
  "angry.critical": {
    heading: "Feeling critical",
    description:
      "Everything is being found wanting, including possibly yourself. A critical mood is not the same as good judgement, though it can be very convincing.",
    strategies: [
      { title: "Check your own state first", body: "Tiredness, hunger and stress all present as other people being irritating. Rule those out before trusting the verdict." },
      { title: "Hold the judgement lightly", body: "Whatever you conclude in this mood, decide it again tomorrow before acting on it." },
      { title: "Find one thing that is genuinely fine", body: "Not as forced positivity — a deliberate counterexample interrupts a mood that is otherwise self-confirming." },
    ],
  },

  /* ---------------- Bad ---------------- */
  "bad.bored": {
    heading: "Feeling bored",
    description:
      "Nothing is holding your attention, and the search for something is itself tiring. Boredom is often restlessness that has not found a direction rather than an absence of things to do.",
    strategies: [
      { title: "Try the boring option first", body: "Boredom usually resolves faster through something slightly effortful than through more scrolling, which tends to extend it." },
      { title: "Change one physical thing", body: "Room, posture, light, outdoors. Attention is more tied to environment than to willpower." },
      { title: "Let it be empty for ten minutes", body: "Boredom is where a lot of ideas come from. It is only unbearable when you fight it." },
    ],
  },
  "bad.busy": {
    heading: "Feeling busy",
    description:
      "There is more coming at you than there is room for, and the volume itself has become the problem. Busyness crowds out the judgement needed to fix busyness.",
    strategies: [
      { title: "Write it all down first", body: "Held in the head, a list feels infinite. On paper it is finite, and usually shorter than it felt." },
      { title: "Find the one thing that matters today", body: "Not the most urgent — the one that would make the rest matter less. Do that one." },
      { title: "Decline one thing", body: "Busyness rarely resolves through efficiency. It resolves through subtraction, which requires saying so to someone." },
    ],
  },
  "bad.stressed": {
    heading: "Feeling stressed",
    description:
      "The demands have outrun your sense of resources to meet them. Stress narrows attention, which is useful in an emergency and unhelpful across a week.",
    strategies: [
      { title: "Interrupt the body first", body: "Stress is physical before it is cognitive. Two minutes of slow breathing does more than ten minutes of planning." },
      { title: "Name what is actually due", body: "Stress inflates everything to the same urgency. Separating what is due today from what merely feels due shrinks it." },
      { title: "Ask what you would drop if you had to", body: "Then consider dropping it now rather than at breaking point." },
    ],
  },
  "bad.tired": {
    heading: "Feeling tired",
    description:
      "There is less in the tank than the day is asking for. Tiredness distorts everything else, which is why it is worth treating before anything it seems to be about.",
    strategies: [
      { title: "Treat it as information, not weakness", body: "Tiredness is a reading. Whatever seems bleak right now deserves a second look after sleep." },
      { title: "Lower the bar for today", body: "Decide what a good enough version of today looks like, and stop there rather than at the usual standard." },
      { title: "Postpone the big decision", body: "Almost nothing needs deciding while this tired, and decisions made here are usually revisited anyway." },
    ],
  },
};
