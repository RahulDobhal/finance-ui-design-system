import React, {useEffect, useReducer, useRef, useState} from 'react';
import {AccessibilityInfo, Animated, Pressable, ScrollView, TextInput, View} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {Button} from './base';
import {FinanceText, useFinanceTheme} from './finance';
import {tokens} from '../src/design-system/tokens';
import {activityLabels, activitySteps, chatReducer, demoResponse, initialChat} from '../src/design-system/chat-state.mjs';

type Activity = keyof typeof activityLabels;
type Feedback = 'like'|'dislike'|null;
const sp=tokens.spacing;
const shape={borderRadius:tokens.radius.md,borderCurve:'continuous' as const};

export function ThinkingIndicator({state='thinking'}:{state?:Activity}) {
  const opacity=useRef(new Animated.Value(1)).current;
  const [reduced,setReduced]=useState(true);
  useEffect(()=>{let mounted=true;AccessibilityInfo.isReduceMotionEnabled().then(v=>{if(mounted)setReduced(v)});const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced);return()=>{mounted=false;sub.remove()}},[]);
  useEffect(()=>{if(reduced||!activitySteps.includes(state)){opacity.setValue(1);return}const loop=Animated.loop(Animated.sequence([Animated.timing(opacity,{toValue:.4,duration:600,useNativeDriver:true}),Animated.timing(opacity,{toValue:1,duration:600,useNativeDriver:true})]));loop.start();return()=>{loop.stop();opacity.setValue(1)}},[reduced,state,opacity]);
  return <View accessibilityLiveRegion="polite" style={{flexDirection:'row',gap:sp[2],alignItems:'center',flexWrap:'wrap'}}><FinanceText tone="muted" kind="label">{activityLabels[state]}</FinanceText>{activitySteps.includes(state)&&<Animated.View accessible={false} style={{opacity}}><FinanceText tone="muted">···</FinanceText></Animated.View>}</View>;
}

export function ThinkingPanel({state='analyzing',defaultExpanded=false,onRetry}:{state?:Activity;defaultExpanded?:boolean;onRetry?:()=>void}) {
  const [expanded,setExpanded]=useState(defaultExpanded),c=useFinanceTheme();
  const current=state==='completed'?4:activitySteps.indexOf(state);
  return <View style={[shape,{borderWidth:1,borderColor:c.border,backgroundColor:c.surface}]}><Pressable accessibilityRole="button" accessibilityLabel={`${activityLabels[state]}, activity summary`} accessibilityState={{expanded}} onPress={()=>setExpanded(!expanded)} style={{padding:tokens.padding.compact,minHeight:tokens.touch.minimum,flexDirection:'row',justifyContent:'space-between',gap:sp[3],alignItems:'center'}}><ThinkingIndicator state={state}/><FinanceText tone="muted">{expanded?'−':'+'}</FinanceText></Pressable>
    {expanded&&<View style={{padding:tokens.padding.compact,paddingTop:0,gap:sp[3]}}><FinanceText kind="label">Activity summary</FinanceText>{current<0?<FinanceText kind="caption" tone="muted">Run ended before a response was ready.</FinanceText>:activitySteps.map((step,i)=><View key={step} style={{flexDirection:'row',justifyContent:'space-between',gap:sp[3],flexWrap:'wrap'}}><FinanceText kind="caption">{activityLabels[step as Activity]}</FinanceText><FinanceText kind="caption" tone="muted">{i<current?'Done':i===current?'In progress':'Not started'}</FinanceText></View>)}<FinanceText kind="caption" tone="muted">Shows operation status only.</FinanceText></View>}
    {state==='error'&&<View style={{padding:tokens.padding.compact,gap:sp[3]}}><FinanceText kind="body-small" tone="danger" accessibilityRole="alert">Connection interrupted. Your query is saved.</FinanceText>{onRetry&&<Button variant="tertiary" onPress={onRetry}>Retry</Button>}</View>}
  </View>;
}

export function ResponseFeedback({value,onChange,disabled=false}:{value:Feedback;onChange:(v:Feedback)=>void;disabled?:boolean}) {
  return <View style={{flexDirection:'row',gap:sp[2],flexWrap:'wrap'}}>{(['like','dislike'] as const).map(choice=><Button key={choice} variant={value===choice?'tertiary':'ghost'} isDisabled={disabled} accessibilityLabel={choice==='like'?'Like response':'Dislike response'} accessibilityState={{selected:value===choice,disabled}} onPress={()=>onChange(value===choice?null:choice)}>{choice==='like'?'Like':'Dislike'}{value===choice?' ✓':''}</Button>)}</View>;
}

export function AgentResponse({children,state='completed',onRetry}:{children?:React.ReactNode;state?:'completed'|'writing'|'error'|'stopped';onRetry?:()=>void}) {
  const [feedback,setFeedback]=useState<Feedback>(null),[copied,setCopied]=useState(false),[copyError,setCopyError]=useState(false);
  const text=children||demoResponse;
  return <View style={{gap:sp[3]}}><FinanceText kind="subtitle">Assistant</FinanceText><FinanceText selectable>{text}</FinanceText>{state==='writing'&&<ThinkingIndicator state="writing"/>}{state==='stopped'&&<FinanceText tone="muted" kind="caption">Response stopped</FinanceText>}{state==='error'&&<><FinanceText accessibilityRole="alert" tone="danger">Response interrupted.</FinanceText>{onRetry&&<Button variant="tertiary" onPress={onRetry}>Retry response</Button>}</>}{state==='completed'&&<><View style={{flexDirection:'row',flexWrap:'wrap',gap:sp[2]}}><ResponseFeedback value={feedback} onChange={setFeedback}/><Button variant="ghost" onPress={async()=>{try{await Clipboard.setStringAsync(typeof text==='string'?text:demoResponse);setCopied(true);setCopyError(false)}catch{setCopyError(true)}}}>{copied?'Copied ✓':'Copy response'}</Button></View><FinanceText kind="caption" tone="muted" accessibilityLiveRegion="polite">{copyError?'Select the response text to copy it.':feedback?'Feedback saved locally':''}</FinanceText></>}</View>;
}

export function UserQuery({children,state='sent',onRetry}:{children:React.ReactNode;state?:'sent'|'sending'|'error';onRetry?:()=>void}) {
  const c=useFinanceTheme();
  return <View style={{alignSelf:'flex-end',maxWidth:'90%',gap:sp[2]}}><FinanceText kind="subtitle" style={{textAlign:'right'}}>You</FinanceText><View style={[shape,{backgroundColor:c['user-message'],padding:tokens.padding.compact}]}><FinanceText selectable>{children}</FinanceText></View>{state!=='sent'&&<FinanceText kind="caption" tone={state==='error'?'danger':'muted'} accessibilityLiveRegion="polite">{state==='sending'?'Sending…':'Not sent'}</FinanceText>}{state==='error'&&onRetry&&<Button variant="tertiary" onPress={onRetry}>Retry query</Button>}</View>;
}

export function PromptInput({value,onChange,onSend,onStop,mode='spacious',state='default'}:{value:string;onChange:(v:string)=>void;onSend:()=>void;onStop?:()=>void;mode?:'spacious'|'compact';state?:'default'|'generating'|'error'|'disabled'}) {
  const c=useFinanceTheme(),[focused,setFocused]=useState(false),generating=state==='generating',disabled=state==='disabled';
  return <View style={[shape,{padding:tokens.padding.compact,gap:sp[2],backgroundColor:c['field-background'],borderWidth:focused?2:1,borderColor:state==='error'?c.danger:focused?c.focus:c['field-border']}]}><TextInput accessibilityLabel="Message" accessibilityHint="Write a message, then activate Send message." multiline editable={!generating&&!disabled} value={value} onChangeText={onChange} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} placeholder={mode==='spacious'?'Ask about your finances…':'Ask a follow-up…'} placeholderTextColor={c['field-placeholder']} textAlignVertical="top" style={{fontSize:tokens.typography.body.size,lineHeight:tokens.typography.body.lineHeight,color:c.foreground,minHeight:mode==='spacious'?96:48,maxHeight:192,padding:0}}/>
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:sp[3],flexWrap:'wrap'}}><FinanceText kind="caption" tone="muted">{generating?'Response in progress':disabled?'Messaging unavailable':'Local demo'}</FinanceText>{generating?<Button variant="secondary" isDisabled={!onStop} onPress={onStop} accessibilityLabel="Stop response">Stop</Button>:<Button isDisabled={disabled||!value.trim()} onPress={()=>{if(value.trim()&&!disabled)onSend()}} accessibilityLabel={state==='error'?'Retry message':'Send message'}>{state==='error'?'Retry':'Send'} ↑</Button>}</View>
    {state==='error'&&<FinanceText accessibilityRole="alert" tone="danger" kind="caption">Couldn’t send. Your draft is saved.</FinanceText>}
  </View>;
}

export function ChatThread({simulateError=false}:{simulateError?:boolean}) {
  const [thread,dispatch]=useReducer(chatReducer,initialChat),[draft,setDraft]=useState('');
  const failedOnce=useRef(false),scroll=useRef<React.ElementRef<typeof ScrollView>>(null),follow=useRef(true);
  useEffect(()=>{if(thread.status!=='generating')return;const timers=activitySteps.slice(1).map((stage,i)=>setTimeout(()=>dispatch({type:'stage',id:thread.requestId,stage}),(i+1)*900));timers.push(setTimeout(()=>{if(simulateError&&!failedOnce.current){failedOnce.current=true;dispatch({type:'fail',id:thread.requestId})}else dispatch({type:'complete',id:thread.requestId,text:demoResponse})},3600));return()=>timers.forEach(clearTimeout)},[thread.status,thread.requestId,simulateError]);
  function send(){if(!draft.trim()||thread.status==='generating')return;dispatch({type:'send',text:draft});setDraft('');follow.current=true}
  return <View style={{gap:sp[6]}}><FinanceText kind="subtitle">Finance assistant · local demo</FinanceText><ScrollView ref={scroll} nestedScrollEnabled style={{maxHeight:420}} contentContainerStyle={{gap:sp[8]}} onContentSizeChange={()=>{if(follow.current)scroll.current?.scrollToEnd({animated:false})}} onScroll={e=>{const n=e.nativeEvent;follow.current=n.contentSize.height-n.contentOffset.y-n.layoutMeasurement.height<60}} scrollEventThrottle={100} keyboardShouldPersistTaps="handled">{!thread.messages.length&&<FinanceText tone="muted">Ask a question to preview the conversation states.</FinanceText>}{thread.messages.map((m:{id:string;role:string;text:string})=>m.role==='user'?<UserQuery key={m.id}>{m.text}</UserQuery>:<AgentResponse key={m.id}>{m.text}</AgentResponse>)}{['generating','error','stopped'].includes(thread.status)&&<ThinkingPanel state={thread.stage as Activity} onRetry={()=>dispatch({type:'retry'})}/>}{thread.status==='stopped'&&<Button variant="tertiary" onPress={()=>dispatch({type:'retry'})}>Try again</Button>}</ScrollView><PromptInput value={draft} onChange={setDraft} onSend={send} onStop={()=>dispatch({type:'stop'})} mode={thread.messages.length?'compact':'spacious'} state={thread.status==='generating'?'generating':'default'}/></View>;
}

export function NativeChatStory({name,state}:{name:string;state:string}) {
  const [draft,setDraft]=useState(''),[feedback,setFeedback]=useState<Feedback>(null),[done,setDone]=useState(false);
  const activity=(['default','expanded','collapsed'].includes(state)?'analyzing':state) as Activity;
  const retry=()=>setDone(true);
  switch(name){
    case'ThinkingIndicator':return <ThinkingIndicator state={done?'completed':activity}/>;
    case'ThinkingPanel':return <ThinkingPanel state={done?'completed':activity} defaultExpanded={state==='expanded'} onRetry={retry}/>;
    case'ResponseFeedback':return <ResponseFeedback value={feedback} onChange={setFeedback} disabled={state==='disabled'}/>;
    case'AgentResponse':return <AgentResponse state={done?'completed':['writing','stopped','error'].includes(state)?state as 'writing'|'stopped'|'error':'completed'} onRetry={retry}/>;
    case'UserQuery':return <UserQuery state={done?'sent':state==='sending'?'sending':state==='error'?'error':'sent'} onRetry={retry}>How much did I spend this week?</UserQuery>;
    case'PromptInput':return <PromptInput value={draft} onChange={setDraft} onSend={()=>{setDraft('');setDone(true)}} onStop={retry} mode={state==='compact'?'compact':'spacious'} state={done?'default':['generating','error','disabled'].includes(state)?state as 'generating'|'error'|'disabled':'default'}/>;
    case'ChatThread':return <ChatThread simulateError={state==='error'}/>;
    default:return null;
  }
}
