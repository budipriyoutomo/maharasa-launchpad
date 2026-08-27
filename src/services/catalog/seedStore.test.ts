import { describeCatalogStoreContract } from "@/test/catalogStoreContract";

import { createSeedCatalogStore } from "./seedStore";

describeCatalogStoreContract("seedStore", () => createSeedCatalogStore());
