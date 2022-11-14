# Konfiguration

## DB

### Auswahl des DBMS

Für die Nutzung einer PostgreSQL-Datenbank oder MongoDB ist die Datei `config.json` anzupassen.

Für PostgreSQL ist unter `use` der Wert `psql` und für MongoDB der Wert `mongodb` anzugeben. Jeder andere Wert wird als InMemoryDB interpretiert.

### Anpassung des Hosts

Wenn Sie eine virtuelle Maschine der DVZ nutzen, dann ist in der Datei `config.json` unter `host` der Wert anzupassen (`stu-fb09-xxx` statt `localhost`).


