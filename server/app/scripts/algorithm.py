"""Legacy algorithm entrypoint.

This script used the old `ClassesFor*` tables in `server/data/classes.db`.
The active app now reads only from `server/data_new/smart_advisors.db` via
`recommendation_engine.py`.
"""

raise RuntimeError(
	"Legacy algorithm.py is disabled. Use app.scripts.recommendation_engine "
	"and server/data_new/smart_advisors.db instead of the old ClassesFor* data."
)
