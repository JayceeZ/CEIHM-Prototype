{Template {
   $classpath:'app.modules.stickywall.views.Timeline',
   $css: ['app.modules.stickywall.views.css.Timeline'],
   $hasScript: true
}}

  {macro main()}
  	{section {
  		macro: "marks",
      bindRefreshTo: [
        {
          to: "wallMarks",
          inside: model,
          recursive: false
        }
      ]
  	}/}
  {/macro}

  {macro marks()}
		{repeater {
      loopType: "array",
      content: model.wallMarks,
      type: "div",
      attributes: {
        classList: ["timeline"]
      },
      childSections : {
        id: "mark",
        type: "div",
        attributes: getMarkAttributes,
        macro: {
          name: "mark",
          scope: this
        }
      }
    }/}
  {/macro}

  {macro mark(child)}
    {var mark = child.item /}
    ${mark.date.toLocaleString()}
  {/macro}

{/Template}

