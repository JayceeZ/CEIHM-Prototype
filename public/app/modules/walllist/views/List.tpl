{Template {
   $classpath:'app.modules.walllist.views.List',
   $css: ['app.modules.walllist.views.css.List'],
   $hasScript: true
}}

	{macro main()}
    <div class="container walllist">
      <div class="list-group">
        {section {
          id : "list",
          macro : "list",
          bindRefreshTo: [{
            to : "walls",
            inside : model,
            recursive : false
          }]
        }/}
      </div>
    </div>
	{/macro}

  {macro list()}
    {repeater {
      loopType: "array",
      content: model.walls,
      type: "div",
      attributes: {
        classList: ["wall"],
      },
      childSections : {
        id: "wall",
        type: "div",
        attributes: wallItemAttributes,
        macro: {
          name: "wallItem",
          scope: this
        }
      }
    }/}
  {/macro}

  {macro wallItem(child)}
    {var wall = child.item /}
    <a class="expand" {on click { fn: "loadWall", scope: this, args: [wall._id]} /}>
    ${wall.name}
    <span class="label label-default label-pill pull-right">${wall.postits.length}</span>
  {/macro}

{/Template}