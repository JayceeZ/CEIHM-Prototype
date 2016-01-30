{Template {
   $classpath:'app.modules.stickywall.views.Wall',
   $css: ['app.modules.stickywall.views.css.Wall'],
   $hasScript: true
}}

	{macro main()}
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
            <li class="active"><a href="#">${model.name}</a></li>
          </ul>
        </div>
      </div>
    </nav>
    <div class="actions">
      {call createPostitDialog() /}
      <div class="btn btn-info" {on click {fn: "onCreatePostit", scope: this}/}>Create Post-It</div>
      <div class="btn btn-danger" {on click {fn: "onDeletePostit", scope: this}/}>Delete Post-It</div>
    </div>
		{call buildWall() /}
	{/macro}

	{macro buildWall()}
		{section {
      id : "wall",
      macro : "postits",
      bindRefreshTo: [{
        to : "postits",
        inside : model,
        recursive : false
      }]
    }/}
    {section {
      id : "compass",
      macro : "compass",
      bindRefreshTo: [{
        to : "x",
        inside : wallOrig,
        recursive : false
      },
      {
        to : "y",
        inside : wallOrig,
        recursive : false
      }]
    }/}
	{/macro}

  {macro compass()}
    <div class="compass">
      x: ${wallOrig.x}<br />
      y: ${wallOrig.y}
    </div>
  {/macro}

  {macro postits()}
    {repeater {
      loopType: "array",
      content: model.postits,
      type: "div",
      attributes: {
        classList: ["wall"],
      },
      on: {
        mousedown: {fn: "onWallMouseDown", scope: this},
        mouseup: {fn: "onWallMouseUp", scope: this},
        mousemove: {fn: "onWallMouseMove", scope: this},
        touchstart: {fn: "onWallTouchStart", scope: this},
        touchmove: {fn: "onWallTouchMove", scope: this},
        touchend: {fn: "onWallTouchEnd", scope: this}
      },
      childSections : {
        id: "postit",
        type: "div",
        attributes: postitAttributes,
        macro: {
          name: "postit",
          scope: this
        }
      }
    }/}
  {/macro}

  {macro createPostitDialog()}
    {@aria:Dialog {
      id : "myDialog",
      title : "Create a postit",
      icon : "std:info",
      minWidth : 400,
      maxHeight : 500,
      modal : true,
      visible : false,
      movable : true,
      macro : "postitCreationDialog",
      bind : {
        "visible" : {
          inside : model,
          to : 'createDialog'
        }
      }
    }/}
  {/macro}

  {macro postitCreationDialog()}
    {@aria:Textarea {
      label : "Nom",
      labelPos : "left",
      helptext : "Enter a name",
      width : 280,
      block : true,
      labelWidth : 100,
      bind : {
        "value" : {
          inside : this.model.postitToEdit,
          to : 'name'
        }
      },
      height : 40
    }/}
    {@aria:Textarea {
      label : "Content",
      labelPos : "left",
      helptext : "The content of the post-it",
      width : 280,
      block : true,
      labelWidth : 100,
      bind : {
      "value" : {
          inside : this.model.postitToEdit,
          to : 'content'
        }
      },
      height : 40
    }/}
    <div class="btn btn-default" {on click {fn: "onValidateCreatePostit", scope: this}/}>Create</div>
  {/macro}

  {macro postit(child)}
    {var postit = child.item /}
    {var selected = (child.index === selectedPostit) ? "selected" : "" /}

    <div class="draggable ${selected}" 
        {on mousedown {fn: "onPostitMouseDown", args: child, scope: this}/}
        {on mouseup {fn: "onPostitMouseUp", args: child, scope: this}/}
        {on touchstart {fn: "onPostitTouchStart", args: child, scope: this}/}
        {on mousemove {fn: "onWallMouseMove", scope: this}/}>
      <div class="name">
        ${postit.name}
      </div>
      <div class="content">
        ${postit.content}
      </div>
    </div>
  {/macro}

{/Template}