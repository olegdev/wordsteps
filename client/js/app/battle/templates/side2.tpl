<div class="field-inner">
<% for(var i = 0; i < fieldSize.rows; i++) { %>
	<% for(var j = 0; j < fieldSize.columns; j++) { %>
		<div class="cell" data-index="<%= i+" "+j %>"></div>
	<% } %>	
<% } %>	
<% for(var i = 0; i < fieldSize.rows; i++) { %>
	<% for(var j = 0; j < fieldSize.columns; j++) { %>
		<% if (field[i][j]) { %>
			<div class="letter"
				data-index="<%= i+" "+j %>"
				data-id="<%= field[i][j].id %>"
				style="left: <%= j*cellWidth %>px; top: <%= i*cellHeight %>px;"
			>
				<%= field[i][j].letter %>
			</div>
		<% } %>
	<% } %>	
<% } %>	
</div>