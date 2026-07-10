-- CreateTable
CREATE TABLE "sourcing_runs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "fetched" INTEGER NOT NULL,
    "created" INTEGER NOT NULL,
    "refreshed" INTEGER NOT NULL,
    "swept" INTEGER NOT NULL,
    "errors" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sourcing_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sourcing_runs_user_id_created_at_idx" ON "sourcing_runs"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "sourcing_runs" ADD CONSTRAINT "sourcing_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
