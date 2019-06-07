initialization
initializePresenter
	list
		whenSelectionChangedDo: [ :selection | 
			[ :item | 
			self draw: item.
			self changeMyTitle: self title , ' ' , item	"Change title" ]
				cull: selection selectedItem ]