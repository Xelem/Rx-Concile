import { isAfter, parseISO } from 'date-fns'

export interface DrugClassItem {
    source: 'ATC' | 'VA' | 'MOA' | 'OTHER'
    classId?: string
    className: string
    classType?: string
}

export interface DrugClassification {
    rxcui: string
    drugName?: string
    classes: DrugClassItem[]
    fetchedAt: string
}

interface RxNavRawItem {
    minConcept?: {
        rxcui?: string
        name?: string
        tty?: string
    }
    rxclassMinConceptItem?: {
        classId?: string
        className?: string
        classType?: string
    }
    rela?: string
    relaSource?: string
}

interface RxNavApiSuccess {
    rxclassDrugInfoList?: {
        rxclassDrugInfo?: RxNavRawItem[]
    }
}

export class RxNavService {
    private static instance: RxNavService | null = null

    private readonly baseUrl =
        'https://rxnav.nlm.nih.gov/REST/rxclass/class/byRxcui.json'
    private readonly cache = new Map<string, DrugClassification>()
    private readonly requestTimeout = 10000
    private readonly cacheTTL = 24 * 60 * 60 * 1000

    private constructor() {}

    static getInstance(): RxNavService {
        if (!RxNavService.instance) {
            RxNavService.instance = new RxNavService()
        }
        return RxNavService.instance
    }

    private async fetchWithTimeout(url: string): Promise<RxNavApiSuccess> {
        const controller = new AbortController()
        const timeout = setTimeout(
            () => controller.abort(),
            this.requestTimeout,
        )

        try {
            const response = await fetch(url, { signal: controller.signal })
            if (!response.ok) {
                throw new Error(
                    `RxNav API request failed with status: ${response.status}`,
                )
            }
            return (await response.json()) as RxNavApiSuccess
        } finally {
            clearTimeout(timeout)
        }
    }

    private extractRelevantClasses(raw: RxNavApiSuccess): DrugClassItem[] {
        const out: DrugClassItem[] = []
        const list = raw.rxclassDrugInfoList?.rxclassDrugInfo
        if (!Array.isArray(list)) return out

        for (const item of list) {
            const cls = item.rxclassMinConceptItem
            if (!cls || !cls.className) continue

            const classTypeRaw = (cls.classType ?? '').toUpperCase()
            let source: DrugClassItem['source'] = 'OTHER'
            if (classTypeRaw.startsWith('ATC')) {
                source = 'ATC'
            } else if (classTypeRaw === 'VA') {
                source = 'VA'
            } else if (classTypeRaw === 'MOA') {
                source = 'MOA'
            }

            if (source !== 'OTHER') {
                out.push({
                    source,
                    classId: cls.classId,
                    className: cls.className,
                    classType: cls.classType,
                })
            }
        }

        const unique = new Map<string, DrugClassItem>()
        for (const c of out) {
            const key = (c.classId ?? c.className).toLowerCase()
            if (!unique.has(key)) unique.set(key, c)
        }

        return Array.from(unique.values())
    }

    public async getDrugClasses(
        rxNormCodes: string[],
    ): Promise<DrugClassification[]> {
        if (!rxNormCodes || rxNormCodes.length === 0) {
            return []
        }

        const results: DrugClassification[] = []
        const rxcuiToFetch: { rxcui: string; index: number }[] = []
        const fetchPromises: Promise<RxNavApiSuccess>[] = []

        rxNormCodes.forEach((rxcui, index) => {
            const cached = this.cache.get(rxcui)
            if (cached && !this.isCacheExpired(cached.fetchedAt)) {
                results[index] = cached
            } else {
                rxcuiToFetch.push({ rxcui, index })
                fetchPromises.push(
                    this.fetchWithTimeout(`${this.baseUrl}?rxcui=${rxcui}`),
                )
            }
        })

        if (fetchPromises.length === 0) {
            return results.filter(Boolean)
        }

        try {
            const fetchedResponses = await Promise.allSettled(fetchPromises)

            fetchedResponses.forEach((settledResult, i) => {
                const { rxcui, index } = rxcuiToFetch[i]

                if (settledResult.status === 'fulfilled') {
                    const rawData = settledResult.value
                    const classes = this.extractRelevantClasses(rawData)

                    const drugName =
                        rawData.rxclassDrugInfoList?.rxclassDrugInfo?.[0]
                            ?.minConcept?.name

                    const newDrugClassification: DrugClassification = {
                        rxcui: rxcui,
                        drugName: drugName,
                        classes: classes,
                        fetchedAt: new Date().toISOString(),
                    }
                    this.cache.set(rxcui, newDrugClassification)
                    results[index] = newDrugClassification
                } else {
                    console.error(
                        `Failed to fetch RxNav data for rxcui ${rxcui}:`,
                        settledResult.reason,
                    )
                }
            })
        } catch (error) {
            console.error('Error during parallel RxNav fetching:', error)
            throw error
        }

        return results.filter(Boolean)
    }

    private isCacheExpired(fetchedAt: string): boolean {
        const fetchDate = parseISO(fetchedAt)
        const expiryDate = new Date(fetchDate.getTime() + this.cacheTTL)
        return isAfter(new Date(), expiryDate)
    }
}
