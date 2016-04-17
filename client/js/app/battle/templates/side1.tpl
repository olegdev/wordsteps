<div class="field-inner">
<% for(var i = fieldSize.rows-1; i >= 0; i--) { %>
	<% for(var j = 0; j < fieldSize.columns; j++) { %>
		<div class="cell"></div>
	<% } %>	
<% } %>	
<% for(var i = 0; i < fieldSize.rows; i++) { %>
	<% for(var j = 0; j < fieldSize.columns; j++) { %>
		<% if (field[i][j]) { %>
			<div class="letter"
				data-id="<%= field[i][j].id %>"
				style="left: <%= j*cellWidth %>px; top: <%= (fieldSize.rows-1-i)*cellHeight %>px;"
			>
				<%= field[i][j].letter %>
			</div>
		<% } %>
	<% } %>	
<% } %>	
</div>