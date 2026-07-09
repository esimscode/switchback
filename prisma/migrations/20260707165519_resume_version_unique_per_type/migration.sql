-- One canonical resume per type per user
CREATE UNIQUE INDEX "resume_versions_user_id_type_key" ON "resume_versions"("user_id", "type");
