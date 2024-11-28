'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { questions } from '../data/questions'
import { personalityDescriptions } from '../data/personalityDescriptions'
import { PersonalityTrait, PersonalityType } from '../types/personality'

export default function PersonalityTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<PersonalityTrait[]>([])
  const [result, setResult] = useState<PersonalityType | null>(null)

  const handleAnswer = (trait: PersonalityTrait) => {
    const newAnswers = [...answers, trait]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      const personalityType = calculatePersonalityType(newAnswers)
      setResult(personalityType)
    }
  }

  const calculatePersonalityType = (answers: PersonalityTrait[]): PersonalityType => {
    const counts: Record<PersonalityTrait, number> = {
      'E': 0, 'I': 0, 'S': 0, 'N': 0, 'T': 0, 'F': 0, 'J': 0, 'P': 0
    }

    answers.forEach(trait => counts[trait]++)

    const type = `${counts['E'] > counts['I'] ? 'E' : 'I'}${counts['S'] > counts['N'] ? 'S' : 'N'}${counts['T'] > counts['F'] ? 'T' : 'F'}${counts['J'] > counts['P'] ? 'J' : 'P'}` as PersonalityType

    return type
  }

  const resetTest = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setResult(null)
  }

  if (result) {
    const personalityResult = personalityDescriptions[result] || { type: result, description: "描述暂未提供。", details: "" }
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-center">你的人格类型是: {result}</CardTitle>
            <CardDescription className="text-lg text-center mt-4">{personalityResult.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-md mt-4">{personalityResult.details}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={resetTest} className="w-full sm:w-auto">重新测试</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl text-center">人格测试</CardTitle>
          <CardDescription className="text-lg text-center mt-2">问题 {currentQuestion + 1} / {questions.length}</CardDescription>
          <Progress value={(currentQuestion + 1) / questions.length * 100} className="mt-4" />
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="question" className="text-xl text-left mb-4">{questions[currentQuestion].text}</Label>
                <RadioGroup onValueChange={(value) => handleAnswer(value as PersonalityTrait)} className="flex flex-col space-y-2">
                  {Object.entries(questions[currentQuestion].options).map(([trait, option]) => (
                    <label key={trait} className="flex items-center space-x-2 justify-start">
                      <RadioGroupItem value={trait} id={`option-${trait}`} />
                      <Label htmlFor={`option-${trait}`} className="text-lg cursor-pointer">{option}</Label>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
