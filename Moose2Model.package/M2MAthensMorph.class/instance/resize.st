initialization
resize
	Transcript show: self extent asIntegerPoint asString.
	surface := AthensCairoSurface extent: self extent asIntegerPoint.
	"So that change is effective immidiately:"
	self changed