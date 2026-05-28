import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { faqs } from '@/components/Home/constants/data'

export const FAQSection = () => {
  return (
    <section className="bg-card py-12">
      <div className="mx-auto w-full max-w-3xl px-4">
        <h2 className="text-primary mb-8 text-center text-3xl font-bold md:text-4xl">
          คำถามที่พบบ่อย
        </h2>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`item-${index}`}
              className="border-border bg-background rounded-lg border px-4"
            >
              <AccordionTrigger className="text-primary text-base font-semibold md:text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
