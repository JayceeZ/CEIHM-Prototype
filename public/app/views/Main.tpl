{Template {
   $classpath:'app.views.Main',
   $css: ['app.views.css.Main'],
   $hasScript: true
}}

  {macro main()}
  	{section {
      id : "menu",
      macro : "menu",
      bindRefreshTo: [{
        to : "moduleLoadedId",
        inside : model,
        recursive : false
      }]
    }/}
    <div id="submodule">
      Loading ...
    </div>
  {/macro}

  {macro menu()}
      <nav class="navbar navbar-default navbar-static-top">
		    <div class="navbar-header">
		      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
		        <span class="sr-only">Toggle navigation</span>
		        <span class="icon-bar"></span>
		        <span class="icon-bar"></span>
		        <span class="icon-bar"></span>
		      </button>
		      <a class="navbar-brand" href="#"><img src="images/logo.png" alt="" /></b></a>
		    </div>
		    <div id="navbar" class="navbar-collapse collapse">
	      <ul class="nav navbar-nav">
	        <li class="${isActive("walllist") ? "active" : ""}"><a href="#" {on click {fn: "loadModule", scope: this, args: ["walllist"]} /}>Walls List</a></li>
	      </ul>
      </div>
    </nav>
  {/macro}
{/Template}