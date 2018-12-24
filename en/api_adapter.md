## Classes

<dl>
<dt><a href="#Adapter">Adapter</a></dt>
<dd></dd>
</dl>

## Constants

<dl>
<dt><a href="#SHARE_ID">SHARE_ID</a></dt>
<dd><p>Default screen-share stream&#39;s id</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#/en/initProfile">initProfile(audience, videoProfile, swapWidthAndHeight)</a></dt>
<dd><p>Encapsulation regular profile you need to set</p>
</dd>
<dt><a href="#initClass">initClass(appId, channel, user)</a></dt>
<dd><p>connect to server and init class through data provider</p>
</dd>
<dt><a href="#enterClass">enterClass(token, info)</a></dt>
<dd><p>actually join media channel to make stream ready</p>
</dd>
<dt><a href="#leaveClass">leaveClass()</a></dt>
<dd><p>leave the media channel</p>
</dd>
<dt><a href="#prepareScreenShare">prepareScreenShare(token, info, timeout)</a></dt>
<dd><p>prepare screen share: initialize and join</p>
</dd>
<dt><a href="#destroyScreenShare">destroyScreenShare()</a></dt>
<dd><p>when you no longer need to do screen sharing, release it</p>
</dd>
<dt><a href="#startScreenShare">startScreenShare()</a></dt>
<dd><p>start screen share</p>
</dd>
<dt><a href="#stopScreenShare">stopScreenShare()</a></dt>
<dd><p>stop screen share</p>
</dd>
<dt><a href="#muteVideo">muteVideo(uids)</a></dt>
<dd><p>uid is undefined =&gt; mute self
uid is number =&gt; mute target uid
uid is Array =&gt; mute target uids</p>
</dd>
<dt><a href="#unmuteVideo">unmuteVideo(uids)</a></dt>
<dd><p>uid is undefined =&gt; unmute self
uid is number =&gt; unmute target uid
uid is Array =&gt; unmute target uids</p>
</dd>
<dt><a href="#muteAudio">muteAudio(uids)</a></dt>
<dd><p>uid is undefined =&gt; mute self
uid is number =&gt; mute target uid
uid is Array =&gt; mute target uids</p>
</dd>
<dt><a href="#unmuteAudio">unmuteAudio(uids)</a></dt>
<dd><p>uid is undefined =&gt; unmute self
uid is number =&gt; unmute target uid
uid is Array =&gt; unmute target uids</p>
</dd>
<dt><a href="#broadcastMessage">broadcastMessage(message, type)</a></dt>
<dd><p>broadcast message in channel</p>
</dd>
<dt><a href="#getUser">getUser(uid)</a> ⇒ <code>Object</code></dt>
<dd><p>get user by uid from userlist</p>
</dd>
</dl>

<a name="Adapter"></a>

## Adapter
**Kind**: global class
<a name="new_Adapter_new"></a>

### new Adapter()
A class representing Adapter.
Adapter is not another sdk, but a flexible, light-weight
encapsulation for Agora Electron sdk for E-edu,
easier to use and extend.

<a name="SHARE_ID"></a>

## SHARE_ID
Default screen-share stream's id

**Kind**: global constant
<a name="initProfile"></a>

## initProfile(audience, videoProfile, swapWidthAndHeight)
Encapsulation regular profile you need to set

**Kind**: global function

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| audience | <code>boolean</code> | <code>false</code> | if user is an audience |
| videoProfile | <code>number</code> | <code>43</code> | videoProfile |
| swapWidthAndHeight | <code>boolean</code> | <code>false</code> | if swap width and height |

<a name="initClass"></a>

## initClass(appId, channel, user)
connect to server and init class through data provider

**Kind**: global function

| Param | Type | Description |
| --- | --- | --- |
| appId | <code>string</code> | Agora App ID |
| channel | <code>string</code> | channel name |
| user | <code>Object</code> | username, role, uid |

<a name="enterClass"></a>

## enterClass(token, info)
actually join media channel to make stream ready

**Kind**: global function

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| token | <code>string</code> | <code>null</code> | token calculated by app id & app cert |
| info | <code>string</code> |  | extra info to be broadcast when joinned channel |

<a name="leaveClass"></a>

## leaveClass()
leave the media channel

**Kind**: global function
<a name="prepareScreenShare"></a>

## prepareScreenShare(token, info, timeout)
prepare screen share: initialize and join

**Kind**: global function

| Param | Type | Default |
| --- | --- | --- |
| token | <code>string</code> | <code>null</code> |
| info | <code>string</code> |  |
| timeout | <code>number</code> | <code>30000</code> |

<a name="destroyScreenShare"></a>

## destroyScreenShare()
when you no longer need to do screen sharing, release it

**Kind**: global function
<a name="startScreenShare"></a>

## startScreenShare()
start screen share

**Kind**: global function
<a name="stopScreenShare"></a>

## stopScreenShare()
stop screen share

**Kind**: global function
<a name="muteVideo"></a>

## muteVideo(uids)
uid is undefined => mute self
uid is number => mute target uid
uid is Array => mute target uids

**Kind**: global function

| Param | Type |
| --- | --- |
| uids | <code>number</code> \| <code>Array.&lt;number&gt;</code> |

<a name="unmuteVideo"></a>

## unmuteVideo(uids)
uid is undefined => unmute self
uid is number => unmute target uid
uid is Array => unmute target uids

**Kind**: global function

| Param | Type |
| --- | --- |
| uids | <code>number</code> \| <code>Array.&lt;number&gt;</code> |

<a name="muteAudio"></a>

## muteAudio(uids)
uid is undefined => mute self
uid is number => mute target uid
uid is Array => mute target uids

**Kind**: global function

| Param | Type |
| --- | --- |
| uids | <code>number</code> \| <code>Array.&lt;number&gt;</code> |

<a name="unmuteAudio"></a>

## unmuteAudio(uids)
uid is undefined => unmute self
uid is number => unmute target uid
uid is Array => unmute target uids

**Kind**: global function

| Param | Type |
| --- | --- |
| uids | <code>number</code> \| <code>Array.&lt;number&gt;</code> |

<a name="broadcastMessage"></a>

## broadcastMessage(message, type)
broadcast message in channel

**Kind**: global function

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  |  |
| type | <code>string</code> | <code>&quot;str&quot;</code> | whether a 'str' or a 'json' |

<a name="getUser"></a>

## getUser(uid) ⇒ <code>Object</code>
get user by uid from userlist

**Kind**: global function
**Returns**: <code>Object</code> - User with username, role and uid

| Param | Type | Description |
| --- | --- | --- |
| uid | <code>number</code> | uid |
