<div id="energy-window">
<% if (hint) { %>
<div class="hints"><%= messages.getByKey("low_energy_hint") %></div>
<% } else { %>
<div class="hints"><%= messages.getByKey("window_title_energy") %></div>
<% } %>
<ul>
<li>
	<button type="button" id="free-energy-btn"><%= messages.getByKey("free-energy-btn-text") %></button>
	<span><%= messages.getByKey('free-energy-btn-hint') %></span>
</li>
<li>
	<button type="button" id="money-energy-btn"><%= moneyView.print(10) %></button>
	<span><%= messages.getByKey('money-energy-btn-hint') %>
</li>
</ul>
</div>