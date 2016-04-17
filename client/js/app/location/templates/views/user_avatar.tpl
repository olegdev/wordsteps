<div class="user-avatar <%= align %> <%= !user ? "empty" : "" %>">
<img src="<%= !user ? "img/panda_50_50.png" : user.info.img %>"/>
<% if (user) { %>
<span><%= user.info.title.replace(/\s+/g,'<br/>') %></span>
<% } else { %>
<span class="loading"></span>
<% } %>
</div>