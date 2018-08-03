## Functions

<dl>
<dt><a href="#connect">connect()</a></dt>
<dd><p>connect - open your data tunnel to server</p>
</dd>
<dt><a href="#disconnect">disconnect()</a></dt>
<dd><p>disconnect - close your data tunnel to server</p>
</dd>
<dt><a href="#dispatch">dispatch(action, payload)</a></dt>
<dd><p>dispatch - dispatch action with payload</p>
</dd>
<dt><a href="#emit">emit(event)</a></dt>
<dd><p>emit events according to status change on server</p>
</dd>
<dt><a href="#on">on(event, callback)</a></dt>
<dd><p>add listener to events</p>
</dd>
</dl>

## Interfaces

<dl>
<dt><a href="#BaseDataProvider">BaseDataProvider</a></dt>
<dd><p>DataProvider is for data exchange between client and server.
You must implement below methods by yourself according to your stack.</p>
</dd>
</dl>

<a name="BaseDataProvider"></a>

## BaseDataProvider
DataProvider is for data exchange between client and server.
You must implement below methods by yourself according to your stack.

**Kind**: global interface
<a name="connect"></a>

## *connect()*
connect - open your data tunnel to server

**Kind**: global abstract function
<a name="disconnect"></a>

## *disconnect()*
disconnect - close your data tunnel to server

**Kind**: global abstract function
<a name="dispatch"></a>

## *dispatch(action, payload)*
dispatch - dispatch action with payload

**Kind**: global abstract function

| Param | Type | Description |
| --- | --- | --- |
| action | <code>string</code> | action name |
| payload | <code>Object</code> | payload for the action |

<a name="emit"></a>

## *emit(event)*
emit events according to status change on server

**Kind**: global abstract function

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | event name |

<a name="on"></a>

## *on(event, callback)*
add listener to events

**Kind**: global abstract function

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | event name |
| callback | <code>functiion</code> | callback function to execute when event emitted |