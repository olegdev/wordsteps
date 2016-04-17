<div id="battle-result-window">
<%= opponentsView.print(user, enemy) %>
<div class="rating-points">
	<%= messages.getByKey("rating") %><span class="<%= isWin ? "green-text" : "red-text" %>"> <%= isWin ? "+" : "-" %><%= isWin ? result.pointsWin: result.pointsLose %></span>
</div>
<% if (result.league && isWin) { %>
<div class="new-league-text"><%= messages.getByKey("new_league_congrats") %> <span class="green-text"><%= leagues.getNameByIndex(result.league)%></span>!</div>
<% } %>
</div>