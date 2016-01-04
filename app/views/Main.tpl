{Template {
   $classpath:'app.views.Main',
   $css: ['app.views.css.Main'],
   $hasScript: true
}}

  {macro main()}
    {if this.dataReady}
      {call navbar()/}
    {/if}
    <div id="submodule">
      Loading ...
    </div>
  {/macro}

  {macro navbar()}
    <nav class="navbar navbar-default navbar-static-top">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="#">PolyWall</a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
          <ul class="nav navbar-nav">
            <li class="active"><a href="#">Stickywall 1</a></li>
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Actions <span class="caret"></span></a>
              <ul class="dropdown-menu">
                <li><a href="#">Nothing</a></li>
                <li role="separator" class="divider"></li>
                <li class="dropdown-header">Nav header</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  {/macro}
{/Template}