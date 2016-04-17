<ul id="rating-list">
<li class="rating-list-header">
	<span class="rating-list-place"><%= messages.getByKey('rating_header_place') %></span>
	<span class="rating-list-online"></span>
	<span class="rating-list-title"><%= messages.getByKey('rating_header_title') %></span>
	<span class="rating-list-points"><%= messages.getByKey('rating_header_points') %></span>
	<span class="rating-list-league"><%= messages.getByKey('rating_header_league') %></span>
</li>
<% for(var i = 0; i < data.length; i++) { %>
<li class="<%= data[i].id == user.id ? 'my-result' : '' %>">
	<span class="rating-list-place"><%= data[i].place + 1 %></span>
	<span class="rating-list-online <%= data[i].online ? "online" : "offline" %>" title="<%= data[i].online ? "online" : "offline" %>"></span>
	<span class="rating-list-title"><img src="<%= data[i].info.img %>"/><%= data[i].info.title %></span>
	<span class="rating-list-points"><%= data[i].rating.points %></span>
	<span class="rating-list-league"><%= leagues.getNameByIndex(data[i].rating.league) %></span>
</li>
<% } %>
</ul>