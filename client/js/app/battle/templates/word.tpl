<% if (word.length) { %>
	<ul>
		<% for(var i = 0; i < word.length; i++) { %><li><%= word[i].letter %></li><% } %>	
	</ul>
	<div class="clear-word-btn" title="<%= messages.getByKey('word-clear-tip') %>">x</div>
<% } else { %>
	<span class="hint"><%= messages.getByKey('word-hint') %></span>
<% } %>
