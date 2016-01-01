{Template {
   $classpath:'app.modules.stickywall.views.Wall',
   $css: ['app.modules.stickywall.views.css.Wall'],
   $hasScript: true
}}

	{macro main()}
		{call buildWall() /}
	{/macro}

	{macro buildWall()}
		{repeater {
			loopType: "array",
			content: postits,
			type: "div",
      id: "wall",
      attributes: {
        classList: ["wall"],
      },
      on: {
        click: {fn: "onWallMouseClick", scope: this},
        mousemove: {fn: "onWallMouseMove", scope: this}
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

  {macro postit(child)}
    {var postit = child.item /}
    <div class="draggable" {on click {fn: "onPostitClick", args: child, scope: this}/}>
      <div class="name">
        ${postit.name}
      </div>
      <div class="content">
        ${postit.content}
      </div>
    </div>
  {/macro}

{/Template}