"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />

      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20 text-center mt-30">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            About <span className="text-primary">Ideary</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A space for thinkers, writers, and dreamers to share ideas that
            shape the world — one story at a time.
          </p>
        </motion.div>
      </section>

      <main className="container mx-auto px-4 py-16 space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Our Mission
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
            At Ideary, our mission is to empower voices everywhere — giving
            people the space to express, inspire, and connect through the power
            of ideas. We believe every thought has the potential to start a
            movement.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-10">
            What We Offer
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Create & Share",
                desc: "Write articles, share stories, and publish your thoughts in an elegant, distraction-free editor.",
              },
              {
                title: "Discover & Connect",
                desc: "Explore content from diverse creators, follow writers you love, and engage with meaningful discussions.",
              },
              {
                title: "Grow & Inspire",
                desc: "Build your personal brand, reach readers who resonate with your ideas, and spark change through your words.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                className="transition-all"
              >
                <Card className="rounded-2xl shadow-md hover:shadow-xl border-muted">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Our Vision
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
            We envision a world where every person has the confidence and tools
            to express their ideas openly. At Ideary, we aim to make publishing
            accessible, inclusive, and inspiring for all.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-10">
            Our Community
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                name: "Creators",
                role: "Writers & Thinkers",
                bio: "The heart of Ideary — those who share their experiences, opinions, and dreams through words.",
              },
              {
                name: "Readers",
                role: "Curious Minds",
                bio: "People who crave knowledge, inspiration, and connection. They read, react, and grow with each story.",
              },
              {
                name: "Collaborators",
                role: "Designers, Devs, & Dreamers",
                bio: "The people behind Ideary — constantly evolving the platform to make your voice heard beautifully.",
              },
            ].map((member, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                className="transition-all"
              >
                <Card className="rounded-2xl shadow-md hover:shadow-xl border-muted text-center">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary font-medium mb-2">
                      {member.role}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
