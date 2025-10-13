import React from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { faqs } from "@/components/Home/constants/data";

export const FAQSection: React.FC = () => {
  return (
    <Box component="section" sx={{ py: 8, bgcolor: "background.paper" }}>
      <Container maxWidth="md">
        <Typography
          variant="h2"
          component="h2"
          color="primary"
          sx={{ textAlign: "center", mb: 6 }}
        >
          คำถามที่พบบ่อย
        </Typography>
        {faqs.map((faq, index) => (
          <Accordion
            key={index}
            sx={{
              bgcolor: "background.default",
              boxShadow: "none",
              border: "1px solid #e0e0e0",
              "&:not(:last-child)": { mb: 2 },
              borderRadius: "8px",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography variant="h6" color="primary">
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
};
