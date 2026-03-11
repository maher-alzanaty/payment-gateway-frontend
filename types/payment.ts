export type Method = {
  id: string
  name: string
  beneficiaryName: string
  accountNumber: string
  logo?: string
  comingSoon?: boolean
}

export type Transaction = {
  id: string
  proof?: string
  status: string
  method?: Method
}

export type Payment = {
  id: string
  clientName: string
  amount: number
  invoiceNo: string
  status: string
  createdAt: string
  transactions?: Transaction[]
}