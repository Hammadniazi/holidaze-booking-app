import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/schemas";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Mail, Clock, CheckCircle2, MessageSquare } from "lucide-react";
import { Container } from "@/components/ui/container";

const SUBJECT_OPTIONS = [
  { value: "general", label: "General enquiry" },
  { value: "booking", label: "Booking help" },
  { value: "hosting", label: "Become a host" },
  { value: "report", label: "Report a problem" },
];

const INFO_CARDS = [
  {
    Icon: Mail,
    title: "Email us",
    detail: "support@holidaze.no",
    sub: "We reply within 24 hours",
  },
  {
    Icon: MapPin,
    title: "Our office",
    detail: "Oslo, Norway",
    sub: "Noroff School of Technology",
  },
  {
    Icon: Clock,
    title: "Support hours",
    detail: "Mon – Fri, 09:00 – 17:00",
    sub: "Central European Time (CET)",
  },
];

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async () => {
    //  simulate send delay then show success state
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
  };

  return (
    <Container className="py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--color-primary)/10">
            <MessageSquare className="h-7 w-7 text-(--color-primary)" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Get in touch
        </h1>
        <p className="text-base sm:text-lg text-(--color-muted-foreground) max-w-xl mx-auto">
          Have a question, need help with a booking, or want to list your venue?
          We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {INFO_CARDS.map(({ Icon, title, detail, sub }) => (
            <Card key={title}>
              <CardContent className="p-5 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-primary)/10">
                  <Icon className="h-5 w-5 text-(--color-primary)" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-sm text-(--color-foreground) mt-0.5">
                    {detail}
                  </p>
                  <p className="text-xs text-(--color-muted-foreground) mt-0.5">
                    {sub}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right: form */}
        <Card className="lg:col-span-3">
          <CardContent className="p-5 sm:p-8">
            {submitted ? (
              <div className="flex flex-col items-center text-center py-8 gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold">Message sent!</h2>
                <p className="text-(--color-muted-foreground) max-w-sm">
                  Thanks for reaching out. We'll get back to you within 24
                  hours.
                </p>
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-6">
                  Send us a message
                </h2>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                  noValidate
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      id="name"
                      label="Your name"
                      placeholder="Your full name"
                      autoComplete="name"
                      error={errors.name?.message}
                      {...register("name")}
                    />
                    <Input
                      id="email"
                      label="Email address"
                      type="email"
                      placeholder="your.email@example.com"
                      autoComplete="email"
                      error={errors.email?.message}
                      {...register("email")}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium text-(--color-foreground)"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      {...register("subject")}
                      defaultValue=""
                      className="h-10 w-full rounded-(--radius) border border-(--color-input) bg-(--color-background) px-3 text-sm text-(--color-foreground) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring)"
                    >
                      <option value="" disabled>
                        Select a subject…
                      </option>
                      {SUBJECT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    {errors.subject && (
                      <p className="text-xs text-(--color-destructive)">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  <Textarea
                    id="message"
                    label="Message"
                    placeholder="Tell us how we can help…"
                    rows={5}
                    error={errors.message?.message}
                    {...register("message")}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? "Sending…" : "Send message"}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};

export default ContactPage;
